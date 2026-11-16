import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import { getPool } from '../db/pool.js';
import type { JwtPayload } from '../middleware/auth.js';
import { requireLiveActor, SecurityAccessError, type LiveUserAuthorization } from './liveAuthorizationService.js';
import { verifyCurrentUserPassword } from '../utils/reauthGuard.js';
import { permissionCatalog, apiPolicies } from '../security/permissionPolicies.js';
import { decideProfilePermission, permissionChanges, isKnownPermission, isPlatformPermission, type ProfileState, type Override } from '../security/profilePermissionEngine.js';

import { validatePermissionRevision, requireRevisionCapacity } from '../security/permissionRevision.js';

type ProfileRow = { user_id: string; company_id: string; template_id: string | null; overrides: Record<string, Override>; warehouse_mode: 'ALL'|'LIST'; warehouse_ids: string[]; permission_admin: boolean; grantable_codes: string[]; revision: number };
type TemplateRow = { id: string; company_id: string; name: string; draft_codes: string[]; draft_revision: number; published_version: number; archived: boolean };
const fail = (message: string, status=403, code='FORBIDDEN'): never => { throw new SecurityAccessError(message,status,code); };

export async function c1Available(db: Pick<PoolClient,'query'>) {
 const r = await db.query<{present:boolean}>(`SELECT to_regclass('public.user_permission_profiles') IS NOT NULL
 AND to_regclass('public.permission_templates') IS NOT NULL
 AND to_regclass('public.permission_template_versions') IS NOT NULL
 AND to_regclass('public.company_permission_defaults') IS NOT NULL AS present`);
 return r.rows[0]?.present === true;
}
function validateCodes(codes: string[]) {
 if (new Set(codes).size!==codes.length || codes.some(c=>!isKnownPermission(c)||isPlatformPermission(c))) fail('قائمة الصلاحيات غير صالحة أو تتضمن امتياز منصة',400,'INVALID_PERMISSIONS');
}
async function rowProfile(db:PoolClient,userId:string) {
 return (await db.query<ProfileRow>('SELECT * FROM user_permission_profiles WHERE user_id=$1',[userId])).rows[0];
}
function withinDelegation(actor:LiveUserAuthorization, delegation:ProfileRow|undefined, codes:string[]) {
 validateCodes(codes);
 if (!actor.is_platform_admin && (!delegation?.permission_admin || codes.some(c=>!delegation.grantable_codes.includes(c)))) fail('الصلاحيات تتجاوز تفويض المنح المستقل');
}
async function userInCompany(db:PoolClient,companyId:string,userId:string) {
 const r=await db.query<LiveUserAuthorization>('SELECT id,company_id,username,full_name,role,is_active,is_platform_admin FROM users WHERE id=$1 AND company_id=$2 FOR SHARE',[userId,companyId]);
 return r.rows[0]??fail('المستخدم غير موجود في الشركة المسموحة',404,'NOT_FOUND');
}
async function template(db:PoolClient,companyId:string,id:string) {
 const r=await db.query<TemplateRow>('SELECT * FROM permission_templates WHERE id=$1 AND company_id=$2',[id,companyId]);
 return r.rows[0]??fail('القالب غير موجود',404,'NOT_FOUND');
}
async function publishedCodes(db:PoolClient,t:TemplateRow) {
 if(!t.published_version)return [];
 const r=await db.query<{codes:string[]}>('SELECT codes FROM permission_template_versions WHERE company_id=$1 AND template_id=$2 AND version=$3',[t.company_id,t.id,t.published_version]);
 return r.rows[0]?.codes??fail('إصدار القالب المنشور غير موجود',409,'INVALID_TEMPLATE_VERSION');
}
async function state(db:PoolClient,companyId:string,userId:string) {
 const user=await userInCompany(db,companyId,userId);
 const company=(await db.query<{is_active:boolean}>('SELECT is_active FROM companies WHERE id=$1 FOR SHARE',[companyId])).rows[0];
 const p=await rowProfile(db,userId);
 if(p&&p.company_id!==companyId)fail('ملف الصلاحيات لا يطابق الشركة الحالية',409,'PROFILE_COMPANY_MISMATCH');
 const t=p?.template_id?await template(db,companyId,p.template_id):null;
 if(t?.archived)fail('القالب المرتبط مؤرشف',409,'ARCHIVED_TEMPLATE');
 const model:ProfileState={userId,companyId,active:user.is_active,companyActive:company?.is_active===true,published:t?await publishedCodes(db,t):[],overrides:p?.overrides??{},warehouseMode:p?.warehouse_mode??'LIST',warehouseIds:p?.warehouse_ids??[]};
 return {user,p,t,model};
}
async function audit(db:PoolClient,actorId:string,companyId:string,action:string,entityId:string|null,details:unknown) {
 await db.query(`INSERT INTO audit_logs(company_id,user_id,action,entity_type,entity_id,details)
 VALUES($1,$2,$3,'PERMISSION_PROFILE',$4,$5::jsonb)`,[companyId,actorId,'C1_'+action,entityId,JSON.stringify(details)]);
}

/** All C1 writes and existing managed-user writes share the SAME advisory lock/order.
 * Reads use a consistent transaction snapshot; nothing is cached between requests/devices. */
export async function permissionTransaction<T>(claims:JwtPayload,token:string|undefined,companyId:string,management:boolean,write:boolean,fn:(db:PoolClient,actor:LiveUserAuthorization,delegation:ProfileRow|undefined)=>Promise<T>) {
 const db=await getPool().connect();
 try{
  await db.query('BEGIN');
  // Serialize even previews against publish/profile changes, allowing stable impact tokens.
  await db.query('SELECT pg_advisory_xact_lock(5005, 1)');
  const actor=await requireLiveActor(db,claims,{token,lock:true});
  if(!actor.is_platform_admin&&(actor.company_id!==companyId||claims.companyId!==companyId))fail('الشركة خارج نطاق الجلسة');
  const company=await db.query('SELECT id FROM companies WHERE id=$1 AND is_active FOR SHARE',[companyId]);
  if(!company.rowCount)fail('الشركة غير متاحة',403,'COMPANY_INACTIVE');
  if(!await c1Available(db))fail('نظام قوالب الصلاحيات غير مجهز بعد؛ النظام السابق مستمر',503,'C1_NOT_INSTALLED');
  const delegation=await rowProfile(db,actor.id);
  if(management&&!actor.is_platform_admin&&(!delegation?.permission_admin||delegation.company_id!==companyId))fail('إدارة الصلاحيات تتطلب تفويضاً مستقلاً');
  const result=await fn(db,actor,delegation);
  // All mutators audit in this transaction; reads never alter profiles.
  await db.query('COMMIT');return result;
 }catch(error){
  await db.query('ROLLBACK');
  const code=(error as {code?:string}).code;
  if(code==='PASSWORD_INVALID')throw new SecurityAccessError('كلمة المرور الحالية غير صحيحة',403,code);
  if(code==='REAUTH_RATE_LIMITED')throw new SecurityAccessError('محاولات كثيرة؛ حاول لاحقاً',429,code);
  throw error;
 }finally{db.release();}
}

export async function getEffectiveProfile(db:PoolClient,companyId:string,userId:string) {
 const s=await state(db,companyId,userId);
 return {userId,companyId,accountActive:s.model.active,companyActive:s.model.companyActive,canUseSystem:s.model.active&&s.model.companyActive,
  configured:Boolean(s.p),legacyBusinessEnforcementUnchanged:true,template:s.t?{id:s.t.id,name:s.t.name,version:s.t.published_version}:null,
  revision:s.p?.revision??0,overrides:s.model.overrides,warehouseMode:s.model.warehouseMode,warehouseIds:s.model.warehouseIds,
  delegation:{enabled:s.p?.permission_admin??false,grantableCodes:s.p?.grantable_codes??[]},
  platformAuthorization:{isPlatformAdmin:s.user.is_platform_admin,managedOutsideTemplates:true,requiresLiveGuardAndReauth:true},
  decisions:permissionCatalog.map(p=>decideProfilePermission(s.model,p.code,{companyId,warehouseIds:[],verified:true})),
  note:'Decisions describe company-level grants; actual resources require checkProfileResource. Platform operations keep live guards.'};
}

export async function listPermissionTemplates(db:PoolClient,companyId:string) {
 return (await db.query('SELECT id,name,draft_revision,published_version,archived,updated_at FROM permission_templates WHERE company_id=$1 ORDER BY name,id',[companyId])).rows;
}
export async function getPermissionTemplate(db:PoolClient,companyId:string,id:string) {
 const draft=await template(db,companyId,id);
 const versions=(await db.query('SELECT version,codes,published_by,published_at FROM permission_template_versions WHERE company_id=$1 AND template_id=$2 ORDER BY version DESC',[companyId,id])).rows;
 return {draft,versions};
}
export async function saveTemplateDraft(db:PoolClient,actor:LiveUserAuthorization,d:ProfileRow|undefined,companyId:string,input:{id?:string;name:string;codes:string[];revision?:number;copyFrom?:string}) {
 let codes=input.codes;
 if(input.copyFrom){const source=await template(db,companyId,input.copyFrom);codes=source.draft_codes;}
 withinDelegation(actor,d,codes);
 let saved:TemplateRow;
 if(input.id){
  validatePermissionRevision(input.revision,1);
  const old=await template(db,companyId,input.id);if(old.archived)fail('لا يمكن تعديل قالب مؤرشف',409);
  withinDelegation(actor,d,old.draft_codes);withinDelegation(actor,d,await publishedCodes(db,old));
  requireRevisionCapacity(old.draft_revision);
  const r=await db.query<TemplateRow>(`UPDATE permission_templates SET name=$3,draft_codes=$4,draft_revision=draft_revision+1,updated_by=$5,updated_at=now()
  WHERE id=$1 AND company_id=$2 AND draft_revision=$6 RETURNING *`,[input.id,companyId,input.name,codes,actor.id,input.revision]);
  saved=r.rows[0]??fail('المسودة تغيرت؛ أعد تحميلها',409,'STALE_DRAFT');
 }else saved=(await db.query<TemplateRow>(`INSERT INTO permission_templates(company_id,name,draft_codes,created_by,updated_by)
 VALUES($1,$2,$3,$4,$4) RETURNING *`,[companyId,input.name,codes,actor.id])).rows[0];
 await audit(db,actor.id,companyId,input.id?'DRAFT_SAVED':input.copyFrom?'TEMPLATE_COPIED':'TEMPLATE_CREATED',saved.id,{revision:saved.draft_revision,codes});return saved;
}

async function templatePublicationImpact(db:PoolClient,companyId:string,id:string) {
 const t=await template(db,companyId,id);if(t.archived)fail('القالب مؤرشف',409);
 const old=await publishedCodes(db,t);
 const users=(await db.query<ProfileRow&{id:string;full_name:string|null;username:string;is_active:boolean}>(`SELECT u.id,u.full_name,u.username,u.is_active,p.* FROM users u JOIN user_permission_profiles p ON p.user_id=u.id AND p.company_id=u.company_id
 WHERE p.company_id=$1 AND p.template_id=$2 ORDER BY u.id FOR SHARE OF u,p`,[companyId,id])).rows;
 const impacted=[];const fingerprint=[];const grantRecipients=[];
 for(const u of users){
  const before:ProfileState={userId:u.id,companyId,active:u.is_active,companyActive:true,published:old,overrides:u.overrides,warehouseMode:u.warehouse_mode,warehouseIds:u.warehouse_ids};
  impacted.push({userId:u.id,name:u.full_name||u.username,changes:permissionChanges(before,{...before,published:t.draft_codes})});fingerprint.push(u);
  // Inactive accounts must not acquire latent grants outside the publisher's ceiling.
  // DENY and existing individual ALLOW still decide whether publication grants anything new.
  const entitlements={...before,active:true,companyActive:true};
  if(permissionChanges(entitlements,{...entitlements,published:t.draft_codes}).some(change=>change.after))grantRecipients.push(u);
 }
 const previewToken=createHash('sha256').update(JSON.stringify({template:t,users:fingerprint})).digest('hex');
 return {t,old,grantRecipients,preview:{id,draftRevision:t.draft_revision,publishedVersion:t.published_version,added:t.draft_codes.filter(c=>!old.includes(c)),removed:old.filter(c=>!t.draft_codes.includes(c)),impacted,previewToken}};
}
export async function previewTemplate(db:PoolClient,companyId:string,id:string) {
 return (await templatePublicationImpact(db,companyId,id)).preview;
}
export async function publishTemplate(db:PoolClient,actor:LiveUserAuthorization,d:ProfileRow|undefined,companyId:string,id:string,previewToken:string) {
 const {preview,t,old,grantRecipients}=await templatePublicationImpact(db,companyId,id);
 if(preview.previewToken!==previewToken)fail('تغير القالب أو المستخدمون منذ المعاينة؛ راجع الفروقات مجدداً',409,'STALE_PREVIEW');
 withinDelegation(actor,d,[...new Set([...t.draft_codes,...old])]);
 for(const recipient of grantRecipients){
  if(recipient.company_id!==companyId)fail('المستخدم المتأثر خارج الشركة المسموحة');
  if(!actor.is_platform_admin&&(!d||d.company_id!==companyId||d.warehouse_mode!=='ALL'&&
   (recipient.warehouse_mode==='ALL'||recipient.warehouse_ids.some(warehouseId=>!d.warehouse_ids.includes(warehouseId)))))
   fail('النشر يمنح مستخدماً صلاحيات خارج نطاق المستودعات المخوّل لك',403,'PUBLISH_WAREHOUSE_SCOPE_DENIED');
 }
 const warehouseIds=[...new Set(grantRecipients.flatMap(recipient=>recipient.warehouse_ids))];
 if(warehouseIds.length){
  const warehouses=await db.query<{id:string}>('SELECT id FROM warehouses WHERE company_id=$1 AND id=ANY($2::uuid[]) FOR SHARE',[companyId,warehouseIds]);
  if(warehouses.rows.length!==warehouseIds.length)fail('نطاق مستودعات مستخدم متأثر لا يطابق الشركة',403,'PUBLISH_WAREHOUSE_SCOPE_DENIED');
 }
 // Cannot update your own effective profile through publishing a shared template.
 if(preview.impacted.some(u=>u.userId===actor.id&&u.changes.length))fail('نشر هذا الإصدار يغيّر صلاحياتك؛ يلزم مسؤول مفوض آخر',403,'SELF_MODIFICATION');
 requireRevisionCapacity(t.published_version);
 await db.query(`INSERT INTO permission_template_versions(company_id,template_id,version,codes,published_by) VALUES($1,$2,$3,$4,$5)`,[companyId,id,t.published_version+1,t.draft_codes,actor.id]);
 await db.query('UPDATE permission_templates SET published_version=published_version+1,updated_by=$3,updated_at=now() WHERE company_id=$1 AND id=$2',[companyId,id,actor.id]);
 await audit(db,actor.id,companyId,'TEMPLATE_PUBLISHED',id,{version:t.published_version+1,previewToken,impacted:preview.impacted});
 return {version:t.published_version+1,impacted:preview.impacted};
}

export async function archiveTemplate(db:PoolClient,actor:LiveUserAuthorization,d:ProfileRow|undefined,companyId:string,id:string) {
 const t=await template(db,companyId,id);withinDelegation(actor,d,[...new Set([...t.draft_codes,...await publishedCodes(db,t)])]);
 const refs=await db.query(`SELECT 1 FROM user_permission_profiles WHERE company_id=$1 AND template_id=$2
 UNION ALL SELECT 1 FROM company_permission_defaults WHERE company_id=$1 AND template_id=$2 LIMIT 1`,[companyId,id]);
 if(refs.rowCount)fail('ألغ ربط المستخدمين والقالب الافتراضي قبل الأرشفة',409,'TEMPLATE_IN_USE');
 await db.query('UPDATE permission_templates SET archived=true,updated_by=$3,updated_at=now() WHERE company_id=$1 AND id=$2',[companyId,id,actor.id]);
 await audit(db,actor.id,companyId,'TEMPLATE_ARCHIVED',id,{});return {archived:true};
}
export async function setDefaultTemplate(db:PoolClient,actor:LiveUserAuthorization,d:ProfileRow|undefined,companyId:string,id:string|null) {
 if(id){const t=await template(db,companyId,id);if(t.archived||!t.published_version)fail('القالب الافتراضي يجب أن يكون منشوراً وفعالاً',409);withinDelegation(actor,d,await publishedCodes(db,t));
 await db.query(`INSERT INTO company_permission_defaults(company_id,template_id,updated_by) VALUES($1,$2,$3)
 ON CONFLICT(company_id) DO UPDATE SET template_id=EXCLUDED.template_id,updated_by=EXCLUDED.updated_by,updated_at=now()`,[companyId,id,actor.id]);
 }else await db.query('DELETE FROM company_permission_defaults WHERE company_id=$1',[companyId]);
 await audit(db,actor.id,companyId,'DEFAULT_CHANGED',id,{});return {templateId:id};
}

export async function updateUserProfile(db:PoolClient,actor:LiveUserAuthorization,d:ProfileRow|undefined,companyId:string,userId:string,input:{templateId:string|null;overrides:Record<string,Override>;warehouseMode:'ALL'|'LIST';warehouseIds:string[];revision:number}) {
 validatePermissionRevision(input.revision,0);
 if(userId===actor.id)fail('لا يمكن تعديل ملف صلاحياتك بنفسك',403,'SELF_MODIFICATION');
 const old=await state(db,companyId,userId);
 if(old.user.is_platform_admin&&!actor.is_platform_admin)fail('حساب المنصة خارج نطاق إدارة الشركة');
 if((old.p?.revision??0)!==input.revision)fail('ملف المستخدم تغير؛ أعد تحميله',409,'STALE_PROFILE');
 requireRevisionCapacity(old.p?.revision??0);
 const codes:string[]=[];
 if(input.templateId){const t=await template(db,companyId,input.templateId);if(t.archived||!t.published_version)fail('القالب غير منشور أو مؤرشف',409);codes.push(...await publishedCodes(db,t));}
 // Removing a privilege also requires authority over the previous value.
 withinDelegation(actor,d,[...new Set([...old.model.published,...Object.keys(old.model.overrides),...codes,...Object.keys(input.overrides)])]);
 if(Object.values(input.overrides).some(v=>!['INHERIT','ALLOW','DENY'].includes(v)))fail('حالة استثناء غير صالحة',400);
 const warehouses=await db.query<{id:string}>('SELECT id FROM warehouses WHERE company_id=$1 AND is_active AND id=ANY($2::uuid[]) FOR SHARE',[companyId,input.warehouseIds]);
 if(warehouses.rows.length!==input.warehouseIds.length||new Set(input.warehouseIds).size!==input.warehouseIds.length)fail('مستودع غير متاح ضمن الشركة',403,'WAREHOUSE_SCOPE_DENIED');
 if(!actor.is_platform_admin){
  if(!d||d.warehouse_mode!=='ALL'&&(input.warehouseMode==='ALL'||input.warehouseIds.some(id=>!d.warehouse_ids.includes(id))))fail('نطاق المستودعات يتجاوز تفويضك');
  if(old.p?.permission_admin)fail('تعديل حساب مسؤول تفويض يتطلب مدير منصة');
 }
 await db.query(`INSERT INTO user_permission_profiles(user_id,company_id,template_id,overrides,warehouse_mode,warehouse_ids,updated_by)
 VALUES($1,$2,$3,$4::jsonb,$5,$6,$7) ON CONFLICT(user_id) DO UPDATE SET template_id=EXCLUDED.template_id,overrides=EXCLUDED.overrides,
 warehouse_mode=EXCLUDED.warehouse_mode,warehouse_ids=EXCLUDED.warehouse_ids,revision=user_permission_profiles.revision+1,updated_by=EXCLUDED.updated_by,updated_at=now()`,
 [userId,companyId,input.templateId,JSON.stringify(input.overrides),input.warehouseMode,input.warehouseMode==='ALL'?[]:input.warehouseIds,actor.id]);
 await audit(db,actor.id,companyId,'PROFILE_UPDATED',userId,{previousRevision:input.revision,templateId:input.templateId,overrides:input.overrides,warehouseMode:input.warehouseMode,warehouseIds:input.warehouseIds});
 return getEffectiveProfile(db,companyId,userId);
}

/** Independent delegation is appointed/revoked ONLY by a live platform administrator,
 * with password reauthentication. No company administrator can appoint another delegator. */
export async function setPermissionDelegation(db:PoolClient,actor:LiveUserAuthorization,companyId:string,userId:string,input:{enabled:boolean;grantableCodes:string[];password:string}) {
 if(!actor.is_platform_admin)fail('تفويض إدارة الصلاحيات خاص بمدير المنصة');
 if(userId===actor.id)fail('لا يمكن تعديل تفويضك بنفسك',403,'SELF_MODIFICATION');
 await verifyCurrentUserPassword(db,actor.id,input.password);
 const user=await userInCompany(db,companyId,userId);if(!user.is_active||user.is_platform_admin)fail('يجب اختيار حساب شركة فعال غير تابع للمنصة',409);
 const existing=await rowProfile(db,userId);if(existing&&existing.company_id!==companyId)fail('ملف الصلاحيات لا يطابق شركة المستخدم',409);
 requireRevisionCapacity(existing?.revision??0);
 validateCodes(input.grantableCodes);
 if(input.enabled&&!input.grantableCodes.length)fail('حدد صلاحية واحدة على الأقل ضمن تفويض المنح',400,'EMPTY_DELEGATION');
 if(!input.enabled){
  const other=await db.query(`SELECT 1 FROM user_permission_profiles p JOIN users u ON u.id=p.user_id AND u.company_id=p.company_id
  WHERE p.company_id=$1 AND p.permission_admin AND u.is_active AND u.id<>$2 LIMIT 1`,[companyId,userId]);
  const current=await rowProfile(db,userId);
  if(current?.permission_admin&&!other.rowCount)fail('لا يمكن سحب تفويض آخر مسؤول فعال للشركة؛ عيّن بديلاً أولاً',409,'LAST_DELEGATOR');
 }
 await db.query(`INSERT INTO user_permission_profiles(user_id,company_id,permission_admin,grantable_codes,updated_by)
 VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id) DO UPDATE SET permission_admin=EXCLUDED.permission_admin,grantable_codes=EXCLUDED.grantable_codes,
 revision=user_permission_profiles.revision+1,updated_by=EXCLUDED.updated_by,updated_at=now()`,[userId,companyId,input.enabled,input.enabled?input.grantableCodes:[],actor.id]);
 await audit(db,actor.id,companyId,'DELEGATION_CHANGED',userId,{enabled:input.enabled,grantableCodes:input.enabled?input.grantableCodes:[]});return {enabled:input.enabled};
}

export async function checkProfileResource(db:PoolClient,companyId:string,userId:string,code:string,resource:{kind:'COMPANY'|'ROLL'|'WAREHOUSE'|'TRANSFER'|'SALES_INVOICE'|'PURCHASE_INVOICE';id?:string}) {
 const s=await state(db,companyId,userId);let warehouseIds:string[]=[];let verified=resource.kind==='COMPANY';
 if(resource.kind==='COMPANY'&&apiPolicies.some(p=>p.warehouse!=='NONE'&&(p.required.includes(code)||p.conditions.some(c=>c.required.includes(code))||Object.values(p.variant?.cases??{}).some(c=>c.includes(code)))))verified=false;
 if(resource.kind!=='COMPANY'){
  const invoiceTable=resource.kind==='SALES_INVOICE'?'sales_invoices':'purchase_invoices';
  const lineTable=resource.kind==='SALES_INVOICE'?'sales_invoice_lines':'purchase_invoice_lines';
  // SQL identifiers are fixed enum constants, not request values.
  const sql=resource.kind==='ROLL'?'SELECT warehouse_id AS id FROM fabric_rolls WHERE id=$1 AND company_id=$2':resource.kind==='WAREHOUSE'?'SELECT id FROM warehouses WHERE id=$1 AND company_id=$2 AND is_active':resource.kind==='TRANSFER'?'SELECT from_warehouse_id AS id FROM inventory_transfers WHERE id=$1 AND company_id=$2 UNION ALL SELECT to_warehouse_id AS id FROM inventory_transfers WHERE id=$1 AND company_id=$2':
  'SELECT warehouse_id AS id FROM '+invoiceTable+' WHERE id=$1 AND company_id=$2 AND warehouse_id IS NOT NULL UNION ALL SELECT COALESCE(l.warehouse_id,r.warehouse_id,i.warehouse_id) AS id FROM '+lineTable+' l JOIN '+invoiceTable+' i ON i.id=l.invoice_id AND i.company_id=l.company_id LEFT JOIN fabric_rolls r ON r.id=l.fabric_roll_id AND r.company_id=l.company_id WHERE i.id=$1 AND i.company_id=$2';
  const rows=await db.query<{id:string|null}>(sql,[resource.id,companyId]);warehouseIds=rows.rows.flatMap(r=>r.id?[r.id]:[]);verified=rows.rows.length>0&&warehouseIds.length===rows.rows.length;
  if(verified){const valid=await db.query('SELECT id FROM warehouses WHERE company_id=$1 AND is_active AND id=ANY($2::uuid[])',[companyId,[...new Set(warehouseIds)]]);verified=valid.rows.length===new Set(warehouseIds).size;}
 }
 return decideProfilePermission(s.model,code,{companyId,warehouseIds,verified});
}

/** Called inside existing managed-user transaction. Absent C1 tables are a strict no-op. */
export async function protectC1ManagedUser(db:PoolClient,actor:LiveUserAuthorization,target:LiveUserAuthorization|undefined,isActive:boolean,currentPassword?:string) {
 if(!target||!await c1Available(db))return;
 const p=await rowProfile(db,target.id);if(!p)return;
 if(p.company_id!==target.company_id)fail('ملف صلاحيات الحساب لا يطابق الشركة',409);
 // A lower legacy role must never allow password reset/takeover of a new privileged profile.
 if(target.id!==actor.id&&!actor.is_platform_admin&&(p.permission_admin||p.template_id||Object.keys(p.overrides).length))fail('إدارة حساب مرتبط بملف صلاحيات تتطلب مدير منصة عبر المسار القديم');
 if(p.permission_admin&&!isActive){
  const other=await db.query(`SELECT 1 FROM user_permission_profiles p JOIN users u ON u.id=p.user_id AND u.company_id=p.company_id
  WHERE p.company_id=$1 AND p.permission_admin AND u.is_active AND u.id<>$2 LIMIT 1`,[target.company_id,target.id]);
  if(!other.rowCount)fail('لا يمكن تعطيل آخر مسؤول تفويض للشركة',409,'LAST_DELEGATOR');
 }
 if(target.id!==actor.id&&actor.is_platform_admin)await verifyCurrentUserPassword(db,actor.id,currentPassword??'');
}
export async function applyNewUserDefault(db:PoolClient,actor:LiveUserAuthorization,companyId:string,userId:string) {
 if(!await c1Available(db))return;
 const r=await db.query<{template_id:string}>('SELECT template_id FROM company_permission_defaults WHERE company_id=$1',[companyId]);
 if(!r.rows[0])return;
 const t=await template(db,companyId,r.rows[0].template_id);if(t.archived||!t.published_version)fail('القالب الافتراضي غير متاح',409);
 withinDelegation(actor,await rowProfile(db,actor.id),await publishedCodes(db,t));
 await db.query('INSERT INTO user_permission_profiles(user_id,company_id,template_id,updated_by) VALUES($1,$2,$3,$4)',[userId,companyId,t.id,actor.id]);
 await audit(db,actor.id,companyId,'DEFAULT_APPLIED_TO_NEW_USER',userId,{templateId:t.id});
}
