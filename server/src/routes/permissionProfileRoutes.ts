import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticateRequest } from '../middleware/auth.js';
import { permissionCatalog } from '../security/permissionPolicies.js';
import { permissionTransaction, getEffectiveProfile, listPermissionTemplates, getPermissionTemplate, saveTemplateDraft, previewTemplate, publishTemplate, archiveTemplate, setDefaultTemplate, updateUserProfile, setPermissionDelegation, checkProfileResource } from '../services/userPermissionProfileService.js';

import { PERMISSION_REVISION_MAX } from '../security/permissionRevision.js';

const uuid=z.string().uuid();
const companyParams=z.object({companyId:uuid});
const templateParams=companyParams.extend({id:uuid});
const userParams=companyParams.extend({userId:uuid});
const codes=z.array(z.string().min(1).max(150)).max(permissionCatalog.length);
const draft=z.object({name:z.string().trim().min(1).max(120),codes}).strict();
const profile=z.object({templateId:uuid.nullable(),overrides:z.record(z.enum(['INHERIT','ALLOW','DENY'])).refine(v=>Object.keys(v).length<=permissionCatalog.length),warehouseMode:z.enum(['ALL','LIST']),warehouseIds:z.array(uuid).max(1000),revision:z.number().int().min(0).max(PERMISSION_REVISION_MAX)}).strict();
export const permissionProfileRoutes:FastifyPluginAsync=async(app)=>{
 app.get('/me',{preHandler:authenticateRequest},async(req)=>{
  const user=req.user!;return permissionTransaction(user,req.authToken,user.companyId,false,false,async(db)=>({ok:true,profile:await getEffectiveProfile(db,user.companyId,user.sub)}));
 });
 app.post('/me/check',{preHandler:authenticateRequest},async(req)=>{
  const body=z.object({code:z.string().max(150),resource:z.discriminatedUnion('kind',[
   z.object({kind:z.literal('COMPANY')}).strict(),z.object({kind:z.enum(['ROLL','TRANSFER','WAREHOUSE','SALES_INVOICE','PURCHASE_INVOICE']),id:uuid}).strict(),
  ])}).strict().parse(req.body);const u=req.user!;
  return permissionTransaction(u,req.authToken,u.companyId,false,false,async(db)=>({ok:true,decision:await checkProfileResource(db,u.companyId,u.sub,body.code,body.resource)}));
 });
 app.get('/companies/:companyId/catalog',{preHandler:authenticateRequest},async(req)=>{
  const {companyId}=companyParams.parse(req.params);return permissionTransaction(req.user!,req.authToken,companyId,true,false,async()=>({ok:true,data:permissionCatalog}));
 });
 app.get('/companies/:companyId/templates',{preHandler:authenticateRequest},async(req)=>{
  const {companyId}=companyParams.parse(req.params);return permissionTransaction(req.user!,req.authToken,companyId,true,false,async(db)=>({ok:true,data:await listPermissionTemplates(db,companyId)}));
 });
 app.post('/companies/:companyId/templates',{preHandler:authenticateRequest},async(req)=>{
  const {companyId}=companyParams.parse(req.params),input=draft.parse(req.body);return permissionTransaction(req.user!,req.authToken,companyId,true,true,async(db,a,d)=>({ok:true,data:await saveTemplateDraft(db,a,d,companyId,input)}));
 });
 app.get('/companies/:companyId/templates/:id',{preHandler:authenticateRequest},async(req)=>{
  const {companyId,id}=templateParams.parse(req.params);return permissionTransaction(req.user!,req.authToken,companyId,true,false,async(db)=>({ok:true,data:await getPermissionTemplate(db,companyId,id)}));
 });
 app.post('/companies/:companyId/templates/:id/copy',{preHandler:authenticateRequest},async(req)=>{
  const {companyId,id}=templateParams.parse(req.params),{name}=z.object({name:draft.shape.name}).strict().parse(req.body);return permissionTransaction(req.user!,req.authToken,companyId,true,true,async(db,a,d)=>({ok:true,data:await saveTemplateDraft(db,a,d,companyId,{name,codes:[],copyFrom:id})}));
 });
 app.put('/companies/:companyId/templates/:id/draft',{preHandler:authenticateRequest},async(req)=>{
  const {companyId,id}=templateParams.parse(req.params),input=draft.extend({revision:z.number().int().positive().max(PERMISSION_REVISION_MAX)}).strict().parse(req.body);return permissionTransaction(req.user!,req.authToken,companyId,true,true,async(db,a,d)=>({ok:true,data:await saveTemplateDraft(db,a,d,companyId,{...input,id})}));
 });
 app.get('/companies/:companyId/templates/:id/preview',{preHandler:authenticateRequest},async(req)=>{
  const {companyId,id}=templateParams.parse(req.params);return permissionTransaction(req.user!,req.authToken,companyId,true,false,async(db)=>({ok:true,data:await previewTemplate(db,companyId,id)}));
 });
 app.post('/companies/:companyId/templates/:id/publish',{preHandler:authenticateRequest},async(req)=>{
  const {companyId,id}=templateParams.parse(req.params),{previewToken}=z.object({previewToken:z.string().regex(/^[a-f0-9]{64}$/)}).strict().parse(req.body);return permissionTransaction(req.user!,req.authToken,companyId,true,true,async(db,a,d)=>({ok:true,data:await publishTemplate(db,a,d,companyId,id,previewToken)}));
 });
 app.post('/companies/:companyId/templates/:id/archive',{preHandler:authenticateRequest},async(req)=>{
  const {companyId,id}=templateParams.parse(req.params);z.object({}).strict().parse(req.body??{});return permissionTransaction(req.user!,req.authToken,companyId,true,true,async(db,a,d)=>({ok:true,data:await archiveTemplate(db,a,d,companyId,id)}));
 });
 app.put('/companies/:companyId/default-template',{preHandler:authenticateRequest},async(req)=>{
  const {companyId}=companyParams.parse(req.params),{templateId}=z.object({templateId:uuid.nullable()}).strict().parse(req.body);return permissionTransaction(req.user!,req.authToken,companyId,true,true,async(db,a,d)=>({ok:true,data:await setDefaultTemplate(db,a,d,companyId,templateId)}));
 });
 app.get('/companies/:companyId/users/:userId/profile',{preHandler:authenticateRequest},async(req)=>{
  const {companyId,userId}=userParams.parse(req.params);return permissionTransaction(req.user!,req.authToken,companyId,true,false,async(db)=>({ok:true,profile:await getEffectiveProfile(db,companyId,userId)}));
 });
 app.put('/companies/:companyId/users/:userId/profile',{preHandler:authenticateRequest},async(req)=>{
  const {companyId,userId}=userParams.parse(req.params),input=profile.parse(req.body);return permissionTransaction(req.user!,req.authToken,companyId,true,true,async(db,a,d)=>({ok:true,profile:await updateUserProfile(db,a,d,companyId,userId,input)}));
 });
 app.put('/companies/:companyId/users/:userId/delegation',{preHandler:authenticateRequest},async(req)=>{
  const {companyId,userId}=userParams.parse(req.params),input=z.object({enabled:z.boolean(),grantableCodes:codes,password:z.string().min(1).max(1024)}).strict().parse(req.body);return permissionTransaction(req.user!,req.authToken,companyId,true,true,async(db,a)=>({ok:true,data:await setPermissionDelegation(db,a,companyId,userId,input)}));
 });
};
