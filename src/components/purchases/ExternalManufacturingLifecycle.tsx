import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getManufacturing, manufacturingAction, type ManufacturingResponse, type ServiceBasis } from '../../lib/api/externalManufacturingApi';
import { listWarehouses, type ApiWarehouse } from '../../lib/api/warehousesApi';
import { listLocations } from '../../lib/api/warehousesApi';
import { postExternalJobFee } from '../../lib/api/externalJobsApi';

type Row = { sourceLineId: string; lengthM: string; weightKg: string; barcode: string; colorName: string; colorCode: string; widthCm: string; gsm: string; defective: boolean; defectReason: 'DYE_HOUSE' | 'INTERNAL_KNITTING' | 'OTHER'; responsibleParty: string; notes: string };
const blank = (): Row => ({ sourceLineId: '', lengthM: '', weightKg: '', barcode: '', colorName: '', colorCode: '', widthCm: '', gsm: '', defective: false, defectReason: 'DYE_HOUSE', responsibleParty: '', notes: '' });
const inputClass = 'border rounded p-2 w-full text-sm';
const remaining = (l: { sent_length_m: string; returned_m: string; shortage_m: string; excess_m: string }) => Math.max(0, Math.round((Number(l.sent_length_m) + Number(l.excess_m) - Number(l.returned_m) - Number(l.shortage_m)) * 1000) / 1000);

export function ExternalManufacturingLifecycle({ jobId, receiving = false }: { jobId: string; receiving?: boolean }) {
  const [response, setResponse] = useState<ManufacturingResponse | null>(null);
  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [locationId, setLocationId] = useState('');
  const [rows, setRows] = useState<Row[]>([blank()]);
  const [paper, setPaper] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);
  const [tab, setTab] = useState<'returns' | 'pricing'>('returns');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const retry = useRef<{ payload: string; id: string } | null>(null);
  const [services, setServices] = useState<{ name: string; quantity: string; basis: ServiceBasis }[]>([]);
  const [prices, setPrices] = useState<{ serviceId: string; unitPrice: string; currencyCode: string; basis: ServiceBasis; approvedQuantity: string }[]>([]);
  const [settlement, setSettlement] = useState({ sourceLineId: '', amountM: '', reason: '', kind: 'SHORTAGE' });
  const load = async () => {
    const result = await getManufacturing(jobId); setResponse(result);
    setServices(result.data.services.map(s => ({ name: s.name, quantity: s.quantity, basis: s.basis })));
    setPrices(result.data.services.map(s => ({ serviceId: s.id, unitPrice: s.unit_price ?? '', currencyCode: s.currency_code ?? 'USD', basis: s.basis, approvedQuantity: s.approved_quantity ?? (s.basis === 'FIXED' ? '1' : s.quantity) })));
  };
  useEffect(() => { let active = true; getManufacturing(jobId).then(result => {
    if (!active) return; setResponse(result);
    setServices(result.data.services.map(s => ({ name: s.name, quantity: s.quantity, basis: s.basis })));
    setPrices(result.data.services.map(s => ({ serviceId: s.id, unitPrice: s.unit_price ?? '', currencyCode: s.currency_code ?? 'USD', basis: s.basis, approvedQuantity: s.approved_quantity ?? (s.basis === 'FIXED' ? '1' : s.quantity) })));
  }).catch(e => { if (active) setError(e.message); }); listWarehouses({ status: 'active' }).then(r => { if (active) setWarehouses(r); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [jobId]);
  useEffect(() => { setLocationId(''); setLocations([]); if (!warehouseId) return; let active = true;
    listLocations(warehouseId).then(r => { if (active) setLocations(r.filter(l => l.is_active)); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; };
  }, [warehouseId]);
  const run = async (work: () => Promise<unknown>, success: string) => {
    if (lock.current) return; lock.current = true; setBusy(true); setError(''); setMessage('');
    try { await work(); setMessage(success); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر الحفظ'); }
    finally { lock.current = false; setBusy(false); }
  };
  const patch = (i: number, next: Partial<Row>) => setRows(old => old.map((r, j) => i === j ? { ...r, ...next } : r));
  const receive = () => run(async () => {
    const payload = { destinationWarehouseId: warehouseId, destinationLocationId: locationId || null, dyePaperNo: paper.trim(), notes: notes.trim() || undefined,
      attachments: attachments.split('\n').map(v => v.trim()).filter(Boolean), completedServiceIds: completed,
      lines: rows.map(r => ({ sourceLineId: r.sourceLineId, lengthM: Number(r.lengthM), weightKg: r.weightKg === '' ? null : Number(r.weightKg),
        barcode: r.barcode.trim() || undefined, colorName: r.colorName.trim() || undefined, colorCode: r.colorCode.trim() || undefined, widthCm: r.widthCm === '' ? null : Number(r.widthCm), gsm: r.gsm === '' ? null : Number(r.gsm),
        defective: r.defective, defectReason: r.defective ? r.defectReason : undefined, responsibleParty: r.defective ? r.responsibleParty.trim() : undefined, notes: r.notes.trim() || undefined })) };
    const signature = JSON.stringify(payload);
    if (!retry.current || retry.current.payload !== signature) retry.current = { payload: signature, id: crypto.randomUUID() };
    await manufacturingAction(jobId, 'returns', { ...payload, requestId: retry.current.id });
    retry.current = null; setRows([blank()]); setPaper(''); setNotes(''); setAttachments(''); setCompleted([]);
  }, 'تم تسجيل الرجعة الفعلية وربطها بالمهمة الأصلية');
  if (!response) return <section className="p-4 border rounded">{error || 'تحميل دورة المصنعية…'}</section>;
  const { data, canPrice, canManage, canReceive } = response;
  const sent = data.lines.reduce((n, l) => n + Number(l.sent_length_m), 0);
  const received = data.lines.reduce((n, l) => n + Number(l.returned_m), 0);
  const shortage = data.lines.reduce((n, l) => n + Number(l.shortage_m), 0);
  const excess = data.lines.reduce((n, l) => n + Number(l.excess_m), 0);
  const defective = data.batches.flatMap(b => b.lines).filter(l => l.defective).reduce((n, l) => n + Number(l.length_m), 0);
  const open = !data.job.lifecycle_closed_at && data.job.document_status === 'CONFIRMED' && !data.legacyMode;
  return <section className="bg-white border rounded-xl p-4 space-y-4" dir="rtl">
    <h3 className="font-bold">دورة المصنعية — {data.job.job_no} — {data.job.supplier_name}</h3>
    {data.job.previous_job_id && <Link to={`/purchases/external-jobs/${data.job.previous_job_id}`} className="text-indigo-600">المهمة السابقة / مرحلة التشغيل السابقة</Link>}
    {error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status" className="text-green-700">{message}</p>}
    {data.legacyMode && <p className="text-amber-800">هذه المهمة مستلمة بالنظام السابق. بياناتها محفوظة؛ لا يمكن خلطها بدفعات جديدة دون مراجعة وترحيل معتمد.</p>}
    <p>المرسل: {sent.toFixed(3)} م — المستلم: {received.toFixed(3)} م — المتبقي: {Math.max(0, sent + excess - received - shortage).toFixed(3)} م — النقص المعتمد: {shortage.toFixed(3)} م — الزيادة المعتمدة: {excess.toFixed(3)} م — المعيب المستلم: {defective.toFixed(3)} م</p>
    <p>{data.job.lifecycle_closed_at ? 'مغلقة بعد حسم الفروقات' : 'مفتوحة'} — {data.job.fee_posted_at ? 'رُحّلت الفاتورة' : data.job.fee_amount !== null ? 'مسعّرة، لم تُرحّل الفاتورة' : 'لم تُسعّر'}</p>
    <div className="flex gap-3"><button onClick={() => setTab('returns')}>البكرات والرجعات والخدمات</button><button onClick={() => setTab('pricing')}>تسعير المصنعية / فاتورة المصنعية</button></div>
    {tab === 'returns' ? <>
      <div className="overflow-auto"><table className="w-full text-sm"><thead><tr>{['الخامة / الكود','اللون / البكرة / الباركود','المرسل م / كغ','المستلم م','المتبقي م','النقص المعتمد م'].map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{data.lines.map(l => <tr key={l.id}><td>{l.item_name} / {l.internal_code}</td><td>{l.color_name} / {l.roll_no} / {l.sent_barcode}</td><td>{l.sent_length_m} / {l.sent_weight_display ?? 'غير مسجل'}</td><td>{l.returned_m}</td><td>{remaining(l).toFixed(3)}</td><td>{l.shortage_m}</td></tr>)}</tbody></table></div>
      <h4 className="font-bold">خدمات المهمة — كمياتها مستقلة ولا تضاعف المخزون</h4>
      {data.services.map(s => <p key={s.id}>{s.name} — {s.quantity} — {s.basis === 'METER' ? 'متر' : s.basis === 'KG' ? 'كيلو' : 'مقطوع'}</p>)}
      {canReceive && open && !data.batches.length && data.job.fee_amount === null && <details><summary>تعديل / إضافة الخدمات قبل الاستلام والتسعير</summary><fieldset disabled={busy} className="space-y-2">
        {services.map((s, i) => <div key={i} className="flex gap-2"><input aria-label="اسم الخدمة" className={inputClass} value={s.name} onChange={e => setServices(a => a.map((v,j) => j === i ? {...v,name:e.target.value} : v))}/><input aria-label="كمية الخدمة" className={inputClass} type="number" min="0.001" step="0.001" value={s.quantity} onChange={e => setServices(a => a.map((v,j) => j === i ? {...v,quantity:e.target.value} : v))}/><select value={s.basis} onChange={e => setServices(a => a.map((v,j) => j === i ? {...v,basis:e.target.value as ServiceBasis} : v))}><option value="METER">متر</option><option value="KG">كيلو</option><option value="FIXED">مقطوع</option></select><button onClick={() => setServices(a => a.filter((_,j) => j !== i))}>حذف</button></div>)}
        <button onClick={() => setServices(a => [...a,{ name:'',quantity:'1',basis:'METER' }])}>إضافة خدمة</button><button onClick={() => run(() => manufacturingAction(jobId,'services',{ services: services.map(s => ({...s,quantity:Number(s.quantity)})) }),'تم حفظ الخدمات')}>حفظ الخدمات</button>
      </fieldset></details>}
      {!receiving && open && canReceive && <Link className="text-indigo-700 font-bold" to={`/inventory/create?externalJobId=${jobId}`}>استلام من مصنعية خارجية</Link>}
      {receiving && canReceive && open && <fieldset disabled={busy} className="space-y-3 border p-3 rounded">
        <legend>إدخال البضاعة الواصلة فعلياً — لا ينشئ مهمة EJ جديدة</legend>
        <label>المستودع<select className={inputClass} value={warehouseId} onChange={e => setWarehouseId(e.target.value)}><option value="">اختر مستودعاً</option>{warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
        <label>موقع التخزين<select className={inputClass} value={locationId} onChange={e => setLocationId(e.target.value)}><option value="">دون موقع</option>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
        <label>رقم ورقة المصبغة<input className={inputClass} required value={paper} onChange={e => setPaper(e.target.value)}/></label>
        {rows.map((r,i) => <div className="border p-3 space-y-2" key={i}>
          <select aria-label="البكرة المرسلة" className={inputClass} value={r.sourceLineId} onChange={e => { const l=data.lines.find(x=>x.id===e.target.value);patch(i,{sourceLineId:e.target.value,widthCm:l?.width_cm??'',gsm:l?.gsm??''}); }}><option value="">اختر البند / البكرة الأصلية</option>{data.lines.filter(l=>remaining(l)>0).map(l=><option key={l.id} value={l.id}>{l.item_name} — {l.color_name} — {l.sent_barcode} — المتبقي {remaining(l)} م</option>)}</select>
          <div className="grid grid-cols-2 gap-2">{(['lengthM','weightKg','barcode','widthCm','gsm'] as const).map((k,j)=><label key={k}>{['الأمتار الفعلية','الوزن الفعلي كغ','الباركود الجديد (فارغ للتوليد)','العرض سم','الوزن النوعي GSM'][j]}<input className={inputClass} type={k==='barcode'?'text':'number'} min="0" step="0.001" value={r[k]} onChange={e=>patch(i,{[k]:e.target.value})}/></label>)}</div>
          <div className="flex gap-2"><input placeholder="اللون الراجع (فارغ للإبقاء على الأصلي)" className={inputClass} value={r.colorName} onChange={e=>patch(i,{colorName:e.target.value})}/><input placeholder="كود اللون الراجع" className={inputClass} value={r.colorCode} onChange={e=>patch(i,{colorCode:e.target.value})}/></div>
          <label><input type="checkbox" checked={r.defective} onChange={e=>patch(i,{defective:e.target.checked})}/> كمية معيبة محجوزة للفحص (سجل الجزء السليم ببند مستقل)</label>
          {r.defective && <><select aria-label="سبب العيب" className={inputClass} value={r.defectReason} onChange={e=>patch(i,{defectReason:e.target.value as Row['defectReason']})}><option value="DYE_HOUSE">عيب مصبغة</option><option value="INTERNAL_KNITTING">عيب حياكة داخلي</option><option value="OTHER">سبب آخر</option></select><input placeholder="الجهة المسؤولة" className={inputClass} value={r.responsibleParty} onChange={e=>patch(i,{responsibleParty:e.target.value})}/></>}
          <input aria-label="ملاحظات البند" placeholder="ملاحظات البند" className={inputClass} value={r.notes} onChange={e=>patch(i,{notes:e.target.value})}/><button onClick={()=>setRows(a=>a.filter((_,j)=>j!==i))}>حذف البند</button>
        </div>)}
        <button onClick={()=>setRows(a=>[...a,blank()])}>إضافة بكرة / جزء آخر</button>
        <p>الخدمات المكتملة في هذه الرجعة:</p>{data.services.map(s=><label className="block" key={s.id}><input type="checkbox" checked={completed.includes(s.id)} onChange={e=>setCompleted(a=>e.target.checked?[...new Set([...a,s.id])]:a.filter(id=>id!==s.id))}/>{s.name}</label>)}
        <textarea placeholder="ملاحظات الرجعة" className={inputClass} value={notes} onChange={e=>setNotes(e.target.value)}/><textarea placeholder="روابط الصور والمرفقات HTTPS، رابط بكل سطر (اختياري)" className={inputClass} value={attachments} onChange={e=>setAttachments(e.target.value)}/>
        <p>مراجعة: {rows.length} رولة/جزء — {rows.reduce((n,r)=>n+Number(r.lengthM||0),0).toFixed(3)} م — {rows.reduce((n,r)=>n+Number(r.weightKg||0),0).toFixed(3)} كغ؛ الأوزان الفارغة غير مسجلة.</p>
        <button disabled={!warehouseId||!paper.trim()||!rows.length||rows.some(r=>!r.sourceLineId||Number(r.lengthM)<=0)} onClick={receive} className="bg-emerald-700 text-white px-4 py-2 rounded">تأكيد الاستلام الفعلي</button>
      </fieldset>}
      {data.batches.map(b=><details key={b.id} open><summary>رجعة {b.dye_paper_no} — {new Date(b.received_at).toLocaleString()}</summary><p>{b.notes}</p><p>الخدمات: {b.service_ids.map(id=>data.services.find(s=>s.id===id)?.name??id).join('، ')}</p>{b.attachments.map(url=><a className="block text-indigo-600" key={url} href={url} target="_blank" rel="noopener noreferrer">مرفق</a>)}
        {b.lines.map(l=><div key={l.id} className="border p-2"><p>{l.original_barcode} ← {l.barcode} — {l.length_m} م / {l.weight_kg??'غير مسجل'} كغ — {l.status}</p><p>{l.defect_reason} {l.responsible_party} {l.notes} {l.resolution} {l.resolution_notes}</p>
          {l.defective&&!l.resolution&&canManage&&<div>{(['ACCEPT','REWORK','WRITE_OFF'] as const).map((decision,i)=><button key={decision} className="border rounded p-2 ml-2" disabled={busy} onClick={()=>{ const note=window.prompt('سبب القرار / ملاحظات المسؤول'); if(note?.trim())void run(()=>manufacturingAction(jobId,'resolve-defect',{returnLineId:l.id,decision,notes:note.trim()}),'تم تسجيل القرار'); }}>{['قبول','إعادة تشغيل','شطب'][i]}</button>)}</div>}
          {l.resolution==='REWORK'&&canReceive&&<Link className="text-indigo-700" to={`/purchases/external-jobs/processing/new?previousJobId=${jobId}`}>إنشاء مهمة مرحلة إعادة التشغيل</Link>}
        </div>)}</details>)}
      <h4>التسويات المعتمدة</h4>{data.settlements.map(s=><p key={s.id}>{s.kind==='EXCESS'?'زيادة معتمدة':'نقص معتمد'} — {s.amount_m} م — {s.reason} — {new Date(s.approved_at).toLocaleString()}</p>)}
      {canManage&&open&&<fieldset disabled={busy} className="border p-3 space-y-2"><legend>اعتماد تسوية الفرق (المعيب الواصل ليس نقصاً)</legend>
        <select aria-label="نوع التسوية" className={inputClass} value={settlement.kind} onChange={e=>setSettlement({...settlement,kind:e.target.value})}><option value="SHORTAGE">نقص</option><option value="EXCESS">زيادة مسموحة للاستلام</option></select>
        <select className={inputClass} value={settlement.sourceLineId} onChange={e=>setSettlement({...settlement,sourceLineId:e.target.value})}><option value="">البند الأصلي</option>{data.lines.filter(l=>settlement.kind==='EXCESS'||remaining(l)>0).map(l=><option value={l.id} key={l.id}>{l.sent_barcode} — {remaining(l)} م</option>)}</select>
        <input aria-label="كمية التسوية" className={inputClass} type="number" min="0.001" step="0.001" value={settlement.amountM} onChange={e=>setSettlement({...settlement,amountM:e.target.value})}/><input placeholder="سبب التسوية" className={inputClass} value={settlement.reason} onChange={e=>setSettlement({...settlement,reason:e.target.value})}/>
        <button onClick={()=>run(async()=>{await manufacturingAction(jobId,'settlements',{...settlement,amountM:Number(settlement.amountM)});setSettlement({sourceLineId:'',amountM:'',reason:'',kind:'SHORTAGE'});},'تم اعتماد التسوية')}>اعتماد التسوية</button><button className="mr-4" onClick={()=>run(()=>manufacturingAction(jobId,'close',{}),'تم إغلاق المهمة بعد حسم الفروقات')}>إغلاق المهمة بعد الحسم</button>
      </fieldset>}
    </> : <div className="space-y-3">
      <p>الأجرة المتفق عليها مرتبطة بخدمات هذه المهمة، وتُرحّل عبر نظام حساب الجهة الخارجية الحالي.</p>
      {!canPrice?<p>التسعير من صلاحية المحاسب المخوّل فقط.</p>:<fieldset disabled={busy||!!data.job.fee_posted_at} className="space-y-3">
        {prices.map((p,i)=><div key={p.serviceId} className="border p-2 grid grid-cols-2 gap-2"><strong>{data.services.find(s=>s.id===p.serviceId)?.name}</strong><label>أساس التسعير<select className={inputClass} value={p.basis} onChange={e=>setPrices(a=>a.map((v,j)=>i===j?{...v,basis:e.target.value as ServiceBasis}:v))}><option value="METER">متر</option><option value="KG">كيلو</option><option value="FIXED">مقطوع</option></select></label>{(['unitPrice','currencyCode','approvedQuantity'] as const).map((k,j)=><label key={k}>{['أجرة الوحدة','العملة','الكمية المعتمدة للتسعير'][j]}<input className={inputClass} type={k==='currencyCode'?'text':'number'} min="0" step="0.0001" value={p[k]} onChange={e=>setPrices(a=>a.map((v,n)=>n===i?{...v,[k]:e.target.value}:v))}/></label>)}<p>الإجمالي: {(Number(p.unitPrice)*Number(p.approvedQuantity)).toFixed(4)} {p.currencyCode}</p></div>)}
        <button disabled={!prices.length||prices.some(p=>p.unitPrice==='')} onClick={()=>run(()=>manufacturingAction(jobId,'service-pricing',{lines:prices.map(p=>({...p,unitPrice:Number(p.unitPrice),approvedQuantity:Number(p.approvedQuantity)}))}),'تم حفظ تسعير الخدمات')}>حفظ تسعير المصنعية</button>
        <button className="mr-4" disabled={data.job.fee_amount===null} onClick={()=>{if(window.confirm('ترحيل فاتورة المصنعية على حساب الجهة الخارجية؟'))void run(()=>postExternalJobFee(jobId),'تم ترحيل الفاتورة');}}>ترحيل فاتورة المصنعية</button>
      </fieldset>}
      <p>إجمالي الأجرة المعتمدة: {data.job.fee_amount??'لم تُسعّر'} {data.job.fee_currency_code} — {data.job.fee_posted_at?'رُحّلت الفاتورة':'غير مرحّلة'}</p>
    </div>}
  </section>;
}
