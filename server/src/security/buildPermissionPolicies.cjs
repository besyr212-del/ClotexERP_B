/* Regenerates reviewed source-derived metadata only. Never imports or starts the ERP.
 * Run with installed TypeScript available (TASK005_TEST_MODULES optionally selects it).
 * No database, environment files, services, seed changes or migrations. */
const fs=require('node:fs'),path=require('node:path');
const {inspectSources,root}=require('./inspectPolicySources.cjs');
const domains={
 dashboard:['dashboard','لوحة التحكم','Kontrol paneli','/'],inventory:['inventory','المخزون','Stok','/inventory'],
 fabric_item:['inventory','الأصناف','Kumaş ürünleri','/inventory/create'],fabric_roll:['inventory','الرولات','Toplar','/inventory/rolls/:id'],
 fabric_category:['inventory','التصنيفات','Kategoriler','/inventory/categories'],fabric_color:['inventory','الألوان','Renkler','/inventory/fabric-master-data'],fabric_variant:['inventory','المتغيرات','Varyantlar','/inventory/fabric-master-data'],fabric_classification:['inventory','حل تصنيف الخامة','Kumaş sınıflandırması','/inventory/categories'],
 yarn:['inventory','الخيوط','İplik','/inventory/yarn'],bulk_pricing:['inventory','التسعير الجماعي','Toplu fiyatlandırma','/inventory/bulk-pricing'],warehouses:['inventory','المستودعات','Depolar','/inventory/warehouses'],warehouse_locations:['inventory','مواقع التخزين','Depo konumları','/inventory/warehouses'],inventory_transfer:['inventory','المناقلات','Depo transferleri','/inventory/transfers'],inventory_waste:['inventory','الهالك','Fire','/inventory/depreciation'],stock_import:['inventory','استيراد المخزون','Stok içe aktarımı','/inventory'],inventory_movements:['inventory','حركات المخزون','Stok hareketleri','/inventory/movements-log'],
 purchase_import:['purchases','استيراد الشراء','Alış içe aktarımı','/purchases/import-excel'],intake_operation:['purchases','عمليات الاستلام','Mal kabul işlemleri','/purchases/intake-operations/new'],intake_dispatch:['purchases','أذون الاستلام والصرف','Giriş çıkış fişleri','/inventory/intake-dispatch-slips'],
 labels:['printing','اللصاقات','Etiketler','/inventory/labels'],label_template:['printing','قوالب اللصاقات','Etiket şablonları','/inventory/labels'],print_jobs:['printing','مهام الطباعة','Yazdırma işleri','/inventory/print-jobs'],cartela:['printing','الكرتالة','Kartela','/cartela'],cartela_swatches:['printing','عينات الألوان','Renk numuneleri','/cartela'],fiber_types:['printing','أنواع الألياف','Elyaf türleri','/cartela'],
 sales:['sales','فواتير البيع','Satış faturaları','/invoices/sales'],purchases:['purchases','فواتير الشراء','Alış faturaları','/invoices/purchases'],sales_return:['sales','مرتجعات البيع','Satış iadeleri','/invoices/returns'],purchase_return:['purchases','مرتجعات الشراء','Alış iadeleri','/invoices/returns'],invoice_statement:['sales','كشف الفاتورة','Fatura ekstresi','/invoices/statement'],
 external_job:['external_jobs','المصنعية الخارجية','Dış imalat','/purchases/external-jobs'],external_job_matching:['external_jobs','مطابقة المصنعية','Dış imalat eşleştirme','/purchases/external-job-matching'],preparation_types:['external_jobs','أنواع التجهيز','Hazırlık türleri','/purchases/external-jobs'],
 customer_orders:['orders','طلبيات العملاء','Müşteri siparişleri','/orders'],order_templates:['orders','قوالب الطلبيات','Sipariş şablonları','/orders'],customers:['customers','العملاء','Müşteriler','/customers'],suppliers:['suppliers','الموردون','Tedarikçiler','/suppliers'],customer_statement:['customers','كشف العميل','Müşteri ekstresi','/customers/statement'],supplier_statement:['suppliers','كشف المورد','Tedarikçi ekstresi','/suppliers/statement'],customer_legacy:['customers','الأرشيف القديم','Eski müşteri arşivi','/customers/statement'],customer_discount:['customers','حسم العميل','Müşteri indirimi','/customers/statement'],party_activity:['parties','سجلات الأطراف','Cari hareket kayıtları','/customers/log'],
 cashboxes:['treasury','الصناديق','Kasalar','/treasury/safes'],cashbox_transfer:['treasury','تحويلات الصناديق','Kasa transferleri','/treasury/safes'],checks:['treasury','الشيكات','Çekler','/treasury/checks-vault'],receipt_voucher:['treasury','سندات القبض','Tahsilat fişleri','/bonds/collection'],payment_voucher:['treasury','سندات الصرف','Ödeme fişleri','/bonds/payment'],expenses:['treasury','المصروفات','Giderler','/expenses'],expense_categories:['treasury','تصنيفات المصروف','Gider kategorileri','/expenses'],
 employees:['hr','ملفات الموظفين','Personel kayıtları','/hr/employees'],employee_wages:['hr','تاريخ الأجر','Ücret geçmişi','/hr/employees'],payroll:['hr','الرواتب','Bordro','/salaries'],payroll_log:['hr','سجل الرواتب','Bordro kayıtları','/salaries/log'],payroll_audit:['hr','تدقيق الرواتب','Bordro denetimi','/salaries/log'],attendance:['hr','الحضور','Devam takibi','/hr/attendance'],shift_types:['hr','الورديات','Vardiyalar','/hr/attendance'],advances:['hr','السلف','Avanslar','/salaries'],
 chart_of_accounts:['finance','دليل الحسابات','Hesap planı','/chart-of-accounts'],journal:['finance','القيود اليدوية','Manuel yevmiye','/journal'],financial:['finance','البيانات المالية الحساسة','Hassas mali veriler','/reports'],financial_audit:['finance','التدقيق المالي','Mali denetim','/reports'],reports:['reports','التقارير','Raporlar','/reports'],
 settings:['settings','الإعدادات','Ayarlar','/settings'],users:['settings','المستخدمون','Kullanıcılar','/settings'],sessions:['settings','الجلسات','Oturumlar','/settings'],business_data:['settings','مسح بيانات الشركة','Şirket verilerini temizleme','/settings'],exchange_rate:['settings','أسعار الصرف','Döviz kurları','/settings'],telegram:['settings','Telegram','Telegram','/settings'],ai:['settings','المساعد الذكي','Yapay zekâ asistanı','/settings'],documents:['printing','إصدار المستندات','Belge üretimi','/invoices/statement'],platform:['platform','إدارة المنصة','Platform yönetimi','/settings'],
 manufacturing:['demo','المصنعية الداخلية التجريبية','Örnek iç imalat','/manufacturing'],partners:['demo','الشركاء التجريبيون','Örnek iş ortakları','/partners'],exchange_invoices:['demo','المبادلات التجريبية','Örnek değişim faturaları','/invoices/exchange'],desktop:['settings','إعدادات سطح المكتب','Masaüstü ayarları','/settings/desktop'],appearance:['settings','المظهر','Görünüm','/settings'],
};
const operations={view:['عرض','Görüntüle'],manage:['إدارة قديمة واسعة','Eski geniş yönetim'],create:['إنشاء','Oluştur'],edit:['تعديل','Düzenle'],delete:['حذف','Sil'],confirm:['تأكيد مستقل','Ayrı onay'],approve:['اعتماد مستقل','Ayrı onaylama'],cancel:['إلغاء','İptal'],void:['إلغاء مستند مؤكد','Onaylı belgeyi iptal et'],post:['ترحيل مالي مستقل','Ayrı mali kayıt'],disburse:['صرف مستقل','Ayrı ödeme'],export:['تصدير','Dışa aktar'],print:['طباعة','Yazdır'],send:['إرسال','Gönder'],preview:['معاينة','Önizle'],import:['استيراد','İçe aktar'],edit_draft:['تعديل المسودة','Taslağı düzenle'],edit_confirmed:['تعديل المؤكد','Onaylı kaydı düzenle'],delete_draft:['حذف المسودة','Taslağı sil'],toggle_status:['تفعيل وتعطيل','Etkinleştir veya durdur'],change_status:['تغيير الحالة','Durumu değiştir'],move:['نقل','Taşı'],sync:['مزامنة','Eşitle'],resolve:['حل أو إنشاء التصنيف','Sınıflandırmayı bul veya oluştur'],complete_fields:['استكمال الحقول','Alanları tamamla'],generate:['توليد','Üret'],finalize_purchase:['إنهاء الشراء','Alışı tamamla'],finalize:['إنهاء','Tamamla'],scan_verify:['التحقق بالمسح','Tarayarak doğrula'],create_purchase_invoice:['إنشاء فاتورة شراء مشتقة','Bağlı alış faturası oluştur'],process:['معالجة','İşle'],edit_processing:['تعديل المعالجة','İşlemeyi düzenle'],void_processing:['إلغاء المعالجة','İşlemeyi iptal et'],receive:['استلام','Teslim al'],price:['تسعير','Fiyatlandır'],record_fee:['تسجيل أجور','Ücretleri kaydet'],post_fee:['ترحيل الأجور','Ücretleri muhasebeleştir'],approve_shortage:['اعتماد النقص','Eksiği onayla'],purge:['حذف نهائي','Kalıcı sil'],purge_preview:['معاينة الحذف النهائي','Kalıcı silmeyi önizle'],purge_voided:['حذف الملغى نهائياً','İptal edilmiş belgeyi kalıcı sil'],repair_rolls:['إصلاح الرولات','Topları onar'],create_from_supplier:['إنشاء من مورد','Tedarikçiden oluştur'],adjust:['تسوية رصيد','Bakiye düzelt'],deposit:['إيداع','Bankaya yatır'],clear:['تحصيل','Tahsil et'],return:['إرجاع','Geri döndür'],revoke:['سحب التفويض','Yetkiyi geri al'],test:['اختبار الاتصال','Bağlantıyı dene'],use:['استخدام','Kullan'],review:['مراجعة','İncele'],update_status:['تحديث الحالة','Durumu güncelle'],import_preview:['معاينة الاستيراد','İçe aktarımı önizle'],view_status:['متابعة الحالة','Durumu izle']};
function build(){
 const source=inspectSources(),catalog=new Map(),rules=new Map();
 Object.assign(operations,{'backup.download':['تنزيل النسخة الكاملة للمنصة','Tam platform yedeğini indir'],financial_import:['استيراد كشف مالي','Mali ekstreyi içe aktar'],cost:['التكلفة','Maliyet'],download:['تنزيل','İndir'],financial_import_post:['اعتماد الاستيراد المالي','Mali içe aktarımı onayla'],print_test:['طباعة اختبار','Test yazdır'],run:['تنفيذ الفحص','Denetimi çalıştır'],'companies.switch':['التبديل بين الشركات','Şirketler arasında geçiş yap']});
 const legacy=new Map(source.legacy.map(x=>[x.code,x.ar]));
 const task004=['exchange_rate.view','exchange_rate.manage','exchange_rate.approve','customer_legacy.import','customer_legacy.review','customer_statement.export'];
 function permission(code,custom={}){
  if(catalog.has(code))return code;
  const domain=code.split('.')[0],d=domains[domain];if(!d)throw Error('Unknown catalog domain '+domain);
  const operation=code.slice(domain.length+1),last=operation.split('.').at(-1),op=({resolve_defect:['اعتماد قرار البضاعة المعيبة','Kusurlu mal kararını onayla'],close:['إغلاق مهمة المصنعية','Dış imalat işini kapat']})[operation]||operations[operation]||operations[last]||[operation,operation];
  catalog.set(code,{code,section:d[0],page:d[3],operation,description:{ar:legacy.get(code)||op[0]+' — '+d[1]+(operation.includes('.')?' ('+operation+')':''),tr:op[1]+' — '+d[2]+(operation.includes('.')?' ('+operation+')':'')},status:legacy.has(code)?'LEGACY':task004.includes(code)?'TASK004_COMPAT':'PROPOSED',...custom});return code;
 }
 function define(plugin,domain,text,options={}){
  for(const line of text.trim().split('\n').map(s=>s.trim()).filter(Boolean)){
   const [signature,tokens]=line.split('|').map(s=>s.trim());if(!tokens)throw Error('Missing policy '+line);
   const [method,...rest]=signature.split(' ');const localPath=rest.join(' ');const key=plugin+'|'+method+'|'+localPath;if(rules.has(key))throw Error('Duplicate rule '+key);
   const required=tokens==='-'?[]:tokens.split(/\s+/).map(t=>permission(t.startsWith('@')?t.slice(1):domain+'.'+t));
   rules.set(key,{required,domain,kind:'BUSINESS',company:'SESSION',warehouse:'NONE',sensitive:[],approval:required.filter(c=>/\.(confirm|approve|post|disburse|post_fee|approve_shortage)$/.test(c)),compound:[],conditions:[],resolver:null,...options});
  }
 }
 define('salesInvoiceRoutes','sales',`GET / | view
GET /:id | view
POST / | create
GET /:id/edit-eligibility | edit_confirmed
PUT /:id/confirmed | edit_confirmed
PUT /:id | edit_draft
DELETE /:id | delete_draft
POST /:id/confirm | confirm
POST /:id/void | void`,{warehouse:'ENTITY_OR_ALLOWED_LIST',sensitive:['inventory.sale_price.view','inventory.cost.view','financial.balances.view']});
 define('purchaseInvoiceRoutes','purchases',`GET / | view
POST /repair-stale-rolls | repair_rolls
GET /:id | view
POST / | create
GET /:id/edit-eligibility | edit_confirmed
PUT /:id/confirmed | edit_confirmed
PUT /:id | edit_draft
DELETE /:id/purge | purge_voided
DELETE /:id | delete_draft
POST /:id/confirm | confirm
POST /:id/void | void`,{warehouse:'ENTITY_OR_ALLOWED_LIST',sensitive:['inventory.cost.view','financial.balances.view']});
 define('inventoryTransferRoutes','inventory_transfer',`GET /eligible-rolls | create
GET / | view
GET /:id | view
POST / | create
PUT /:id | edit
PATCH /:id/confirm | confirm
PATCH /:id/cancel | cancel`,{warehouse:'SOURCE_AND_DESTINATION',sensitive:['inventory.cost.view']});
 define('inventoryWasteRoutes','inventory_waste',`GET / | view
GET /:id | view
POST / | create
PUT /:id | edit
PATCH /:id/confirm | confirm
PATCH /:id/cancel | cancel`,{warehouse:'ENTITY_OR_ALLOWED_LIST',sensitive:['inventory.cost.view']});
 define('fabricRollRoutes','fabric_roll',`GET / | @inventory.view
GET /sold-material-report | @reports.sold_materials.view
GET /bulk-pricing/recent-purchase-invoices | @bulk_pricing.view
GET /next-barcode | create
GET /bulk-pricing/groups | @bulk_pricing.view
PATCH /bulk-pricing | @bulk_pricing.edit
POST /bulk-pricing/finalize-purchase | @bulk_pricing.finalize_purchase @purchases.create
GET /:id | @inventory.view
PATCH /:id/missing-fields | complete_fields
POST / | create
PUT /:id | edit
PATCH /:id/status | change_status
POST /:id/move | move
GET /:id/movements | movements.view`,{warehouse:'ENTITY_OR_ALLOWED_LIST',sensitive:['inventory.cost.view','inventory.sale_price.view']});
 define('yarnLotRoutes','yarn',`GET / | view
GET /:id | view
POST / | create
PUT /:id | edit
PATCH /:id/status | change_status`,{warehouse:'ENTITY_OR_ALLOWED_LIST',sensitive:['inventory.cost.view','inventory.sale_price.view']});
 for(const [plugin,domain,extra]of [['fabricCategoryRoutes','fabric_category','POST /sync-from-materials | sync\nGET /path/:id | view\nGET /tree | view'],['fabricItemRoutes','fabric_item','GET /:id/colors | view'],['fabricColorRoutes','fabric_color',''],['fabricVariantRoutes','fabric_variant','']])define(plugin,domain,`GET / | view
GET /:id | view
POST / | create
PUT /:id | edit
PATCH /:id/toggle-status | toggle_status
${extra}`);
 define('fabricClassificationRoutes','fabric_classification','POST /resolve | resolve');
 define('warehouseRoutes','warehouses',`GET / | view
GET /:id | view
POST / | create
PUT /:id | edit
PATCH /:id/toggle-status | toggle_status
GET /:warehouseId/locations | @warehouse_locations.view
POST /:warehouseId/locations | @warehouse_locations.create`,{warehouse:'ENTITY_OR_ALLOWED_LIST'});
 define('warehouseLocationRoutes','warehouse_locations',`PUT /:id | edit
PATCH /:id/toggle-status | toggle_status`,{warehouse:'ENTITY_LOOKUP'});
 define('stockImportRoutes','stock_import','POST / | create\nGET /:batchId/status | view_status',{warehouse:'ENTITY_LOOKUP',sensitive:['inventory.cost.view']});
 define('purchaseImportRoutes','purchase_import',`POST /preview | preview
GET /:id | view
GET /:id/rows | view
POST /:id/scan-verify | scan_verify
POST /:id/confirm | confirm
POST /:id/cancel | cancel
GET / | view`,{warehouse:'ENTITY_LOOKUP',sensitive:['inventory.cost.view']});
 define('intakeOperationRoutes','intake_operation','GET /:id | view\nPOST / | create\nPOST /:id/finalize | finalize',{warehouse:'ENTITY_LOOKUP'});
 define('intakeDispatchSlipRoutes','intake_dispatch',`GET / | view
GET /:id | view
PATCH /:id/lines | edit
POST /:id/void | void
POST /:id/create-purchase-invoice | create_purchase_invoice @purchases.create`,{warehouse:'ENTITY_OR_ALLOWED_LIST',sensitive:['inventory.cost.view']});
 define('inventoryMovementsLogRoutes','inventory_movements','GET /documents | view\nGET / | view',{warehouse:'ENTITY_OR_ALLOWED_LIST',sensitive:['inventory.cost.view']});
 define('labelPrintRoutes','labels',`GET /templates | @label_template.view
GET /templates/default | @label_template.view
POST /rolls/preview | preview
POST /rolls/preview-by-batch | preview
POST /print-jobs | print
PATCH /print-jobs/:id/status | @print_jobs.update_status
GET /print-jobs | @print_jobs.view
GET /print-jobs/:id | @print_jobs.view`,{warehouse:'ENTITY_LOOKUP',resolver:'PRINTED_ROLLS_AND_TEMPLATE_FIELDS'});
 define('cartelaRoutes','cartela',`GET /fiber-types | @fiber_types.view
POST /fiber-types | @fiber_types.create
DELETE /fiber-types/:id | @fiber_types.delete
GET / | view
POST /generate | generate
POST /quick-draft | create
GET /lookup | view
GET /:cartelaId/colors | @cartela_swatches.view
GET /:cartelaId/colors/catalog-options | @cartela_swatches.view
POST /:cartelaId/colors | @cartela_swatches.create
PUT /color-swatches/:id | @cartela_swatches.edit
DELETE /color-swatches/:id | @cartela_swatches.delete
GET /:id | view
POST / | create
PUT /:id | edit
DELETE /:id | delete`);
 define('customerRoutes','customers',`GET / | view
GET /:id/statement | @customer_statement.view
GET /:id | view
POST / | create
POST /from-supplier/:supplierId | create_from_supplier @suppliers.view
POST /import-statement | @customer_statement.financial_import @customer_statement.financial_import.post
PUT /:id | edit
PATCH /:id/toggle-status | toggle_status
GET /:id/purge-preview | purge_preview
DELETE /:id | purge`,{sensitive:['customers.contacts.view','financial.balances.view']});
 define('customerLegacyImportRoutes','customer_statement','POST /:customerId/legacy-statement-import | financial_import financial_import.post',{sensitive:['financial.balances.view'],compound:['CURRENT_CLOTEX_FINANCIAL_IMPORT_NOT_TASK004_ARCHIVE','AUTOMATIC_GL_AND_OPENING_BALANCE'],resolver:'IMPORTED_DOCUMENT_TYPES'});
 define('supplierRoutes','suppliers',`GET / | view
GET /:id/statement | @supplier_statement.view
GET /:id | view
POST / | create
PUT /:id | edit
PATCH /:id/toggle-status | toggle_status`,{sensitive:['suppliers.contacts.view','financial.balances.view']});
 define('customerDiscountRoutes','customer_discount','GET / | view\nPOST / | create\nPOST /:id/cancel | cancel',{sensitive:['financial.balances.view'],compound:['AUTOMATIC_GL']});
 define('partyActivityLogRoutes','party_activity','GET /summary | view\nGET / | view\nPOST / | create',{resolver:'PERSISTED_PARTY_TYPE_AND_PARTY_COMPANY',sensitive:['customers.contacts.view','suppliers.contacts.view']});
 define('customerOrderRoutes','customer_orders',`GET / | view
GET /templates | @order_templates.view
POST /templates | @order_templates.create
DELETE /templates/:id | @order_templates.delete
GET /import-preview/:orderNo | import_preview
GET /:id | view
POST / | create
PUT /:id | edit
PATCH /:id/status | change_status
DELETE /:id | delete`,{sensitive:['inventory.sale_price.view','customers.contacts.view']});
 define('externalJobRoutes','external_job',`GET /preparation-types | @preparation_types.view
POST /preparation-types | @preparation_types.create
PATCH /preparation-types/:id | @preparation_types.edit
POST /processing | process
PATCH /:id/processing | edit_processing
POST /:id/void-processing | void_processing
GET / | view
GET /:id | view
POST / | create
POST /:id/confirm | confirm
POST /:id/lines/:lineId/receive | receive
POST /:id/fee | record_fee
POST /:id/pricing | price
POST /:id/post-fee | post_fee
GET /:id/receipt | view
POST /:id/receipt | receive
POST /:id/receipt/approve-shortage | approve_shortage
POST /:id/void | void`,{warehouse:'ENTITY_LOOKUP',sensitive:['inventory.cost.view','financial.balances.view']});
 define('externalManufacturingRoutes','external_job',`GET /:id/lifecycle | view
POST /:id/lifecycle/returns | receive
POST /:id/lifecycle/services | edit_processing
POST /:id/lifecycle/settlements | approve_shortage
POST /:id/lifecycle/resolve-defect | resolve_defect
POST /:id/lifecycle/service-pricing | price
POST /:id/lifecycle/close | close`,{warehouse:'ENTITY_LOOKUP',sensitive:['inventory.cost.view','financial.balances.view']});
 define('externalJobMatchingRoutes','external_job_matching','GET / | view\nGET /:supplierId/:fabricItemId/lines | view\nPOST /approve-shortage | @external_job.approve_shortage',{warehouse:'ENTITY_LOOKUP',sensitive:['inventory.cost.view']});
 define('cashboxRoutes','cashboxes',`GET / | view
GET /movements/all | movements.view
GET /:id | view
POST / | create
PUT /:id | edit
PATCH /:id/toggle-status | toggle_status
GET /:id/movements | movements.view
POST /:id/adjustment | adjust`,{sensitive:['financial.balances.view'],resolver:'CASHBOX_COMPANY'});
 define('cashboxTransferRoutes','cashbox_transfer','GET / | view\nGET /:id | view\nPOST / | create\nPOST /:id/confirm | confirm\nPOST /:id/void | void',{sensitive:['financial.balances.view'],resolver:'BOTH_CASHBOXES',compound:['AUTOMATIC_GL']});
 define('checksRoutes','checks','GET / | view\nPOST / | create\nPOST /:id/deposit | deposit\nPOST /:id/clear | clear\nPOST /:id/return | return',{sensitive:['financial.balances.view'],resolver:'CHECK_PARTY_AND_CASHBOX'});
 define('voucherRoutes','receipt_voucher','GET / | view\nGET /:id | view\nPOST / | create\nPUT /:id | edit\nPATCH /:id/confirm | confirm\nPATCH /:id/cancel | cancel',{sensitive:['financial.balances.view'],resolver:'PERSISTED_VOUCHER_TYPE_PARTY_CASHBOX',compound:['AUTOMATIC_GL_AND_INVOICE_BALANCE']});
 define('returnInvoiceRoutes','sales_return',`GET / | view
GET /eligible-sales-invoices | view @sales.view
GET /eligible-purchase-invoices | @purchase_return.view @purchases.view
GET /source-invoice/:invType/:invId | view
GET /:id | view
POST / | create
PUT /:id | edit
PATCH /:id/confirm | confirm
PATCH /:id/cancel | cancel`,{warehouse:'ENTITY_LOOKUP',sensitive:['inventory.cost.view','financial.balances.view'],resolver:'PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE'});
 define('operatingExpenseRoutes','expenses','GET /categories | @expense_categories.view\nGET / | view\nPOST / | create\nPOST /:id/cancel | cancel',{sensitive:['financial.balances.view'],compound:['AUTOMATIC_GL']});
 define('payrollRoutes','payroll',`GET /employees | @employees.view
POST /employees | @employees.create
PUT /employees/:id | @employees.edit
PATCH /employees/:id/toggle-status | @employees.toggle_status
GET /employees/:id/wage-history | @employee_wages.view
POST /employees/:id/pay-salary | disburse
POST /employees/:id/advance | @advances.create
GET /advance-installments | @advances.view
PATCH /advance-installments/:id/mark-paid | @advances.approve
GET /salary-log | @payroll_log.view
GET /audit-log | @payroll_audit.view
GET /runs | view
GET /runs/:id | view
POST /runs/import-excel | import
POST /runs | create
PUT /runs/:id | edit
PATCH /runs/:id/confirm | approve
PATCH /runs/:id/mark-paid | disburse
PATCH /runs/:id/cancel | cancel`,{sensitive:['payroll.salary.view','employees.personal_data.view'],resolver:'EMPLOYEE_OR_PAYROLL_RUN_COMPANY'});
 define('attendanceRoutes','attendance','GET / | view\nPOST /import | import\nPUT /:id | edit\nGET /shift-types | @shift_types.view\nPOST /shift-types | @shift_types.create\nGET /monthly-review | monthly_review.view\nPOST /monthly-review/approve | approve',{sensitive:['employees.personal_data.view']});
 define('financeRoutes','journal','GET /chart-of-accounts | @chart_of_accounts.view\nGET /journal | view\nGET /gl-accounts | @chart_of_accounts.view\nPOST /journal-entries | create post',{sensitive:['financial.balances.view']});
 define('financialAuditRoutes','financial_audit','GET /full | view run\nGET /invoice-consistency | view run',{sensitive:['financial.balances.view','inventory.cost.view','financial.profit.view']});
 define('exchangeRateRoutes','exchange_rate','GET / | view\nGET /:currencyCode | view\nPUT /:currencyCode | manage');
 define('systemRoutes','settings',`GET /info | -
GET /settings | view
PUT /settings/:key | manage
POST /telegram/test | @telegram.test
GET /telegram/updates | @telegram.view
GET /permissions | @users.permissions.view
PUT /roles/:code | @platform.roles.manage
GET /users | @users.view
POST /users | @users.create
PUT /users/:id | @users.edit
GET /active-sessions | @sessions.view
DELETE /active-sessions/:sessionKey | @sessions.revoke
POST /purge-business-data | @business_data.purge`);
 define('platformBackupRoutes','platform','GET /backup/download | -\nPOST /backup/download | backup.download',{kind:'PLATFORM',company:'PLATFORM',sensitive:['platform.backup.download'],resolver:null});
 define('permissionProfileRoutes','users',`GET /me | -
POST /me/check | -
GET /companies/:companyId/catalog | permissions.view
GET /companies/:companyId/templates | permissions.view
GET /companies/:companyId/templates/:id | permissions.view
POST /companies/:companyId/templates | edit
POST /companies/:companyId/templates/:id/copy | edit
PUT /companies/:companyId/templates/:id/draft | edit
GET /companies/:companyId/templates/:id/preview | permissions.view
POST /companies/:companyId/templates/:id/publish | edit
POST /companies/:companyId/templates/:id/archive | edit
PUT /companies/:companyId/default-template | edit
GET /companies/:companyId/users/:userId/profile | permissions.view
PUT /companies/:companyId/users/:userId/profile | edit
PUT /companies/:companyId/users/:userId/delegation | @platform.roles.manage`,{resolver:'LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE',compound:['C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED','LIVE_COMPANY_SCOPE','C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED']});
 define('companyRoutes','platform','GET /public | -\nGET / | companies.view\nPOST / | companies.create\nPUT /:id | companies.edit',{kind:'PLATFORM',company:'PLATFORM'});
 define('activationRoutes','platform','GET /status | -\nPOST /activate | -\nGET /keys | activation.view\nPOST /keys/generate | activation.generate\nPATCH /keys/:id/revoke | activation.revoke\nGET /events | activation.view\nGET /devices | activation.view',{kind:'PLATFORM',company:'PLATFORM'});
 define('authRoutes','platform','POST /login | -\nPOST /logout | -\nGET /presence | -\nGET /me | -\nPOST /switch-company | companies.switch',{kind:'SELF',company:'SELF'});
 define('healthRoutes','platform','GET /health/live | -\nGET /health | -',{kind:'PUBLIC',company:'PUBLIC'});
 define('telegramRoutes','telegram',`GET /settings | view
PUT /settings | manage
POST /test-bot | test
POST /fetch-updates | manage
GET /detected-chats | view
GET /chat-links | view
POST /chat-links | manage
PUT /chat-links/:id | manage
PATCH /chat-links/:id/toggle-status | manage
DELETE /chat-links/:id | manage
POST /chat-links/:id/test-message | test
POST /invoice | send @invoice_statement.view
POST /statement | send @documents.send
POST /voucher | send @documents.send`,{sensitive:['settings.secrets.manage'],resolver:'CHAT_LINK_AND_TARGET_COMPANY'});
 define('aiRoutes','ai','GET /settings | settings.view\nPUT /settings | settings.manage\nPOST /test-connection | test\nPOST /fabric-chat | use',{sensitive:['settings.secrets.manage','inventory.cost.view','financial.profit.view'],resolver:'SERVER_TOOL_DATA_SCOPE_AND_FIELDS'});
 define('documentPdfRoutes','documents','POST /render | export',{resolver:'TRUSTED_DOCUMENT_CONTEXT_NOT_HTML_OR_FILENAME',sensitive:['inventory.cost.view','financial.profit.view','financial.balances.view','payroll.salary.view']});
 for(const r of source.declarations.filter(r=>r.plugin==='reportRoutes')){
  const suffix=r.localPath.slice(1).replaceAll('/','.').replaceAll('-','_');
  define('reportRoutes','reports',`${r.method} ${r.localPath} | ${suffix}.view`,{warehouse:/^\/(inventory|purchases|sales|printing)(\/|-)|^\/(dashboard-summary|executive\/)/.test(r.localPath)?'ENTITY_OR_ALLOWED_LIST':'NONE',sensitive:/^\/printing\//.test(r.localPath)?[]:/payroll/.test(r.localPath)?['payroll.salary.view','employees.personal_data.view']:/profit|margin|income|position|executive|dashboard/.test(r.localPath)?['financial.profit.view','financial.balances.view','inventory.cost.view']:/inventory|valuation|cost|purchases/.test(r.localPath)?['inventory.cost.view','financial.balances.view']:/^\/sales\//.test(r.localPath)?['inventory.sale_price.view','financial.balances.view']:/financial|cashbox|voucher|statement|aging|customers|suppliers|parties/.test(r.localPath)?['financial.balances.view']:['inventory.cost.view'],resolver:'REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION'});
 }
 // Existing keys are retained verbatim. They are not seeded, granted or expanded at runtime.
 for(const row of source.legacy)permission(row.code);
 for(const code of task004)permission(code);
 for(const code of ['inventory.cost.view','inventory.sale_price.view','financial.balances.view','financial.profit.view','payroll.salary.view','employees.personal_data.view','customers.contacts.view','suppliers.contacts.view','settings.secrets.manage','reports.view','reports.print','reports.export','customer_statement.print','customer_statement.send','supplier_statement.print','supplier_statement.export','supplier_statement.send','invoice_statement.view','invoice_statement.print','invoice_statement.export','labels.custom.view','labels.custom.print','inventory.settings.view','inventory.settings.manage','desktop.settings.view','desktop.settings.manage','desktop.print_test','appearance.manage','manufacturing.view','partners.view','exchange_invoices.view'])permission(code);
 for(const domain of ['sales_return','purchase_return','receipt_voucher','payment_voucher'])for(const op of ['view','create','edit','confirm','cancel'])permission(domain+'.'+op);
 const publicReasons={
  'healthRoutes|GET|/health/live':['فحص حياة محدود دون بيانات أعمال','Sınırlı canlılık kontrolü, iş verisi yok'],
  'healthRoutes|GET|/health':['حالة اتصال دون سجلات أعمال','İş kaydı içermeyen bağlantı durumu'],
  'systemRoutes|GET|/info':['معلومات إصدار عامة فقط','Yalnızca genel sürüm bilgisi'],
  'companyRoutes|GET|/public':['قائمة معرفات وأسماء الشركات لشاشة الدخول؛ ليس قراءة بياناتها','Giriş için şirket kimlik/ad listesi; şirket verilerine erişim değil'],
  'authRoutes|POST|/login':['بدء المصادقة؛ لا يمكن اشتراط جلسة سابقة','Kimlik doğrulamayı başlatır; önceki oturum gerekmez'],
  'authRoutes|POST|/logout':['إنهاء الجلسة المقدمة فقط؛ لا صلاحيات أعمال','Yalnızca sunulan oturumu sonlandırır; iş yetkisi vermez'],
  'activationRoutes|GET|/status':['حالة التفعيل المحدودة قبل الدخول؛ ليست إدارة تراخيص','Giriş öncesi sınırlı aktivasyon durumu; lisans yönetimi değil'],
  'activationRoutes|POST|/activate':['التحقق من مفتاح التفعيل الحالي؛ ليس توليد مفاتيح','Mevcut aktivasyon anahtarını doğrular; anahtar üretmez'],
 };
 const policyRows=[];
 for(const r of source.routes){
  const key=r.plugin+'|'+r.method+'|'+r.localPath,rule=rules.get(key);if(!rule)throw Error('Unmapped actual route '+key);
  const p={...JSON.parse(JSON.stringify(rule)),id:r.method+' '+r.path,method:r.method,path:r.path,source:{file:r.file,plugin:r.plugin,localPath:r.localPath},currentGuard:r.currentGuard,authentication:true,exemptionReason:null};
  if(publicReasons[key]){p.kind='PUBLIC';p.company='PUBLIC';p.authentication=false;p.required=[];p.resolver=null;p.sensitive=[];p.exemptionReason={ar:publicReasons[key][0],tr:publicReasons[key][1]};}
  if(r.plugin==='authRoutes'&&['/me','/presence'].includes(r.localPath))p.exemptionReason={ar:'قراءة أو تحديث جلسة المستخدم نفسه فقط، مع المصادقة',tr:'Kimlik doğrulamayla yalnızca kendi oturumunu okur veya günceller'};
  if(r.plugin==='permissionProfileRoutes'){
   p.c1Control='INDEPENDENT_PERMISSION_ADMIN';
   if(['/me','/me/check'].includes(r.localPath)){p.kind='SELF';p.company='SELF';p.exemptionReason={ar:'فحص ملف المستخدم نفسه فقط؛ لا تعديل ولا كشف موارد أعمال',tr:'Yalnızca kendi yetki profilini denetler; değişiklik veya iş verisi erişimi sağlamaz'};}
   if(p.kind==='SELF')p.c1Control='SELF_PROFILE';
   if(r.localPath.endsWith('/delegation')){p.kind='PLATFORM';p.company='PLATFORM';p.compound.push('CURRENT_PASSWORD_REAUTH','LAST_DELEGATOR_PROTECTION');}
   if(p.kind==='PLATFORM')p.c1Control='LIVE_PLATFORM_REAUTH';
  }
  if(key==='platformBackupRoutes|GET|/backup/download'){p.kind='RETIRED';p.exemptionReason={ar:'GET مغلق دائماً؛ لا تعود له صلاحية بتنفيذ HEAD أو مراقبة',tr:'GET daima kapalıdır; HEAD veya izleme izin vermez'};}
  if(key==='authRoutes|POST|/switch-company'||key==='systemRoutes|PUT|/roles/:code'){p.kind='PLATFORM';p.company='PLATFORM';}
  if(['salesInvoiceRoutes','purchaseInvoiceRoutes'].includes(r.plugin)&&r.method==='POST'&&r.localPath==='/'){
   p.conditions.push({when:'CONFIRM_TRUE',required:[permission(rule.domain+'.confirm')]});
   p.conditions.push({when:'CONFIRM_AND_PAID',required:[permission((rule.domain==='sales'?'receipt_voucher':'payment_voucher')+'.create'),permission((rule.domain==='sales'?'receipt_voucher':'payment_voucher')+'.confirm')]});p.compound.push('OPTIONAL_IMMEDIATE_CONFIRM','OPTIONAL_AUTOMATIC_PAYMENT','AUTOMATIC_GL_NOT_MANUAL_JOURNAL_PERMISSION');
  }
  if(/confirm|finalize|receive|cancel|void/.test(r.localPath)&&['salesInvoiceRoutes','purchaseInvoiceRoutes','returnInvoiceRoutes','inventoryTransferRoutes','inventoryWasteRoutes','intakeOperationRoutes','intakeDispatchSlipRoutes','purchaseImportRoutes','externalJobRoutes'].includes(r.plugin))p.compound.push('INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION');
  if(key==='customerRoutes|POST|/import-statement'){
   p.compound=['FINANCIAL_IMPORT','AUTOMATIC_GL_NOT_MANUAL_JOURNAL_PERMISSION'];p.resolver='IMPORTED_CREDITS_ADJUSTMENTS_AND_CUSTOMER_CREATION';
   p.conditions.push({when:'SALE_LINES_PRESENT',required:['sales.create','sales.confirm']},{when:'PAYMENTS_PRESENT',required:['receipt_voucher.create','receipt_voucher.confirm']},{when:'RETURN_PAYMENTS_PRESENT',required:['payment_voucher.create','payment_voucher.confirm']});
  }
  if(key==='intakeDispatchSlipRoutes|POST|/:id/create-purchase-invoice'||key==='fabricRollRoutes|POST|/bulk-pricing/finalize-purchase'){
   p.required.push(permission('purchases.confirm'));p.compound.push('DERIVED_PURCHASE_DOCUMENT_IS_CONFIRMED_WITH_SKIP_STOCK_MOVEMENT');
  }
  if(r.plugin==='externalJobRoutes'&&['/:id/fee','/:id/pricing','/:id/post-fee','/processing','/:id/receipt'].includes(r.localPath))p.compound.push('EXTERNAL_PROCESSING_PRICING_RECEIPT_OR_FEE_POSTING');
  if(r.plugin==='externalManufacturingRoutes'){
   p.resolver='EXTERNAL_JOB_AND_SOURCE_DESTINATION_ROLL_WAREHOUSES_IN_SESSION_COMPANY';
   if(r.method==='POST')p.compound.push('EXTERNAL_JOB_LIFECYCLE_MUTATION');
   if(r.localPath.endsWith('/returns'))p.compound.push('INVENTORY_RECEIPT_AND_QUALITY_RESERVATION');
   if(r.localPath.endsWith('/settlements'))p.compound.push('APPROVED_SHORTAGE_OR_EXCESS_AND_SOURCE_BALANCE');
   if(r.localPath.endsWith('/resolve-defect')){p.approval=[permission('external_job.resolve_defect')];p.compound.push('QUALITY_DECISION_CHANGES_ROLL_STATUS');}
   if(r.localPath.endsWith('/service-pricing'))p.compound.push('SERVICE_PRICING_UPDATES_FEE_HEADER_NOT_GL_POSTING');
   if(r.localPath.endsWith('/close'))p.approval=[permission('external_job.close')];
  }
 if(key==='externalJobRoutes|POST|/processing'){p.required.push(permission('external_job.confirm'));p.compound.push('PROCESSING_IS_CREATED_CONFIRMED_AND_SENDS_ROLLS');}
  if(key==='customerDiscountRoutes|POST|/'){p.required.push(permission('customer_discount.approve'));p.compound.push('IMMEDIATE_CONFIRMED_DISCOUNT_AND_AUTOMATIC_GL');}
  if(key==='operatingExpenseRoutes|POST|/'){p.required.push(permission('expenses.confirm'));p.compound.push('IMMEDIATE_CASHBOX_DEBIT_AND_AUTOMATIC_GL');}
  if(r.plugin==='voucherRoutes'){
   const op=rule.required[0].split('.').at(-1);p.required=[];p.variant={source:r.method==='POST'?'BODY: voucherType':'PERSISTED: voucher_type',cases:{RECEIPT:['receipt_voucher.'+op],PAYMENT:['payment_voucher.'+op]}};
   if(r.method==='GET'&&r.localPath==='/')p.variant.source='SERVER_FILTERED_VOUCHER_TYPE_LIST';
  }
  if(r.plugin==='returnInvoiceRoutes'&&!r.localPath.startsWith('/eligible-')){
   const op=rule.required[0].split('.').at(-1);p.required=[];p.variant={source:r.method==='POST'?'BODY: returnType':'PERSISTED: return_type',cases:{SALES_RETURN:['sales_return.'+op],PURCHASE_RETURN:['purchase_return.'+op]}};
   if(r.method==='GET'&&r.localPath==='/')p.variant.source='SERVER_FILTERED_RETURN_TYPE_LIST';
  }
  if(r.plugin==='telegramRoutes'&&['/invoice','/statement','/voucher'].includes(r.localPath)){
   p.compound.push('READ_EXPORT_SEND_TRUSTED_DOCUMENT_AND_RECIPIENT');p.resolver='TRUSTED_DOCUMENT_AND_TARGET_COMPANY_NOT_HTML_CHATID_OR_FILENAME';
   if(r.localPath==='/statement')p.variant={source:'TRUSTED: statement party type',cases:{CUSTOMER:['customer_statement.view','customer_statement.export','customer_statement.send'],SUPPLIER:['supplier_statement.view','supplier_statement.export','supplier_statement.send']}};
  }
  if(r.plugin==='documentPdfRoutes')p.compound.push('READ_AND_EXPORT_PERMISSION_OF_TRUSTED_SOURCE_DOCUMENT');
  if(r.plugin==='platformBackupRoutes'&&r.method==='POST')p.compound.push('LIVE_PLATFORM_FLAG','CURRENT_PASSWORD_REAUTH_BEFORE_AND_AFTER_DUMP','DURABLE_PLATFORM_AUDIT');
  if(r.plugin==='reportRoutes'){
   p.required.push(...p.sensitive.filter(code=>['payroll.salary.view','financial.profit.view'].includes(code)||code==='inventory.cost.view'&&/valuation|cost-trend/.test(r.localPath)));p.compound.push('REPORT_FIELD_AND_WAREHOUSE_PROJECTION','PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS');
  }
  for(const code of [...p.required,...p.sensitive,...p.approval,...p.conditions.flatMap(x=>x.required),...Object.values(p.variant?.cases||{}).flat()])permission(code);
  p.approval=[...new Set([...p.approval,...p.required.filter(c=>/\.(confirm|approve|post|disburse)$/.test(c)),...p.conditions.flatMap(x=>x.required).filter(c=>/\.(confirm|approve|post|disburse)$/.test(c)),...Object.values(p.variant?.cases||{}).flat().filter(c=>/\.(confirm|approve)$/.test(c))])];
  p.approval.push(...p.required.filter(c=>/\.(clear|deposit|return|adjust|finalize|purge|purge_voided|edit_confirmed)$/.test(c)));
  policyRows.push(p);
 }
 for(const key of rules.keys())if(!source.declarations.some(d=>key===d.plugin+'|'+d.method+'|'+d.localPath))throw Error('Stale policy '+key);
 // Reuse report names already present in the actual Arabic/Turkish report catalog.
 const reportCards=[...fs.readFileSync(path.join(root,'src/pages/reports/ReportsCenter.tsx'),'utf8').matchAll(/\{ id: '([^']+)', path: '([^']+)'/g)];
 for(const lang of ['ar','tr']){
  const locale=JSON.parse(fs.readFileSync(path.join(root,'src/locales/'+lang+'/reportsCenter.json'),'utf8'));
  const find=(obj,id)=>{if(!obj||typeof obj!=='object')return null;if(obj[id]?.title)return obj[id].title;for(const value of Object.values(obj)){const title=find(value,id);if(title)return title;}return null;};
  for(const m of reportCards){const code='reports.'+m[2].slice(1).replaceAll('/','.').replaceAll('-','_')+'.view';const title=find(locale,m[1]);if(title&&catalog.has(code))catalog.get(code).description[lang]=(lang==='ar'?'عرض تقرير — ':'Raporu görüntüle — ')+title;}
 }
 const reportTitles={cashbox_summary:['ملخص الصناديق','Kasa özeti'],dashboard_summary:['ملخص لوحة التحكم','Kontrol paneli özeti'],'financial.cash_flow':['التدفقات النقدية','Nakit akışı'],'financial.operational_balance_summary':['ملخص الأرصدة التشغيلية','Operasyonel bakiye özeti'],'financial.operational_income_expense':['الإيرادات والمصروفات التشغيلية','Operasyonel gelir ve giderler'],'financial.operational_ledger':['دفتر العمليات','İşlem defteri'],'financial.operational_position':['المركز المالي التشغيلي','Operasyonel mali durum'],'financial.profit_details':['تفاصيل الأرباح','Kâr ayrıntıları'],inventory_summary:['ملخص المخزون','Stok özeti'],'inventory.damaged_stock':['المخزون التالف','Hasarlı stok'],'inventory.negative_stock':['المخزون السالب','Negatif stok'],payroll_summary:['ملخص الرواتب','Maaş özeti'],'payroll.summary':['ملخص الرواتب','Maaş özeti'],'sales.by_item_color':['المبيعات حسب الخامة واللون','Kumaş ve renge göre satışlar'],sold_materials:['الخامات المباعة','Satılan kumaşlar'],vouchers_summary:['ملخص السندات','Makbuz özeti']};
 for(const [name,[ar,tr]]of Object.entries(reportTitles)){const p=catalog.get('reports.'+name+'.view');if(p)p.description={ar:'عرض تقرير — '+ar,tr:'Raporu görüntüle — '+tr};}
 const extraPages={
  Dashboard:'dashboard.view',Inventory:'inventory.view',CreateItem:'fabric_item.create',CreateRoll:'fabric_roll.create',RollDetails:'inventory.view',IntakeDispatchSlips:'intake_dispatch.view',InventoryMovementsLog:'inventory_movements.view',YarnManagement:'yarn.view',InventorySettings:'inventory.settings.view',StickerPrinting:'labels.print',CustomStickerPrinting:'labels.custom.view',CartelaLabels:'cartela.view',BulkPricing:'bulk_pricing.view',Warehouses:'warehouses.view',Transfers:'inventory_transfer.view',Depreciation:'inventory_waste.view',Categories:'fabric_category.view',FabricMasterData:'fabric_item.view',ImportExcel:'purchase_import.preview',ImportBatches:'purchase_import.view',ExternalJobs:'external_job.view',ExternalJobProcessingNew:'external_job.process',IntakeOperationNew:'intake_operation.create',ExternalJobMatching:'external_job_matching.view',ExternalJobReceipt:'external_job.view',PrintJobs:'print_jobs.view',Sales:'sales.view',Purchases:'purchases.view',InvoiceForm:'sales.create',ExchangeInvoices:'exchange_invoices.view',ReturnInvoices:'sales_return.view',InvoiceStatement:'invoice_statement.view',CustomerOrdersPage:'customer_orders.view',Safes:'cashboxes.view',ChecksVault:'checks.view',TreasuryLog:'cashboxes.movements.view',ProfitDetails:'financial.profit.view',TreasurySettings:'cashboxes.view',PaymentBonds:'payment_voucher.view',CollectionBonds:'receipt_voucher.view',BondRecords:'receipt_voucher.view',BondDetails:'receipt_voucher.view',Salaries:'payroll.view',Employees:'employees.view',Attendance:'attendance.view',MonthlyAttendanceReview:'attendance.monthly_review.view',PayrollSalaryLog:'payroll_log.view',ReportsCenter:'reports.view',Customers:'customers.view',CustomersLog:'party_activity.view',CustomerStatement:'customer_statement.view',Suppliers:'suppliers.view',SuppliersLog:'party_activity.view',SupplierStatement:'supplier_statement.view',Expenses:'expenses.view',Accounting:'chart_of_accounts.view',Journal:'journal.view',Manufacturing:'manufacturing.view',Partners:'partners.view',SystemSettings:'settings.view',DesktopSettings:'desktop.settings.view',RequireAuth:'dashboard.view',Navigate:'cartela.view',Login:null,
 };
 const pages=source.frontend.map(r=>{if(!(r.component in extraPages))throw Error('Unmapped frontend component '+r.component);let code=extraPages[r.component];if(r.path.includes('purchases/new'))code='purchases.create';if(r.path.includes('purchases/:id/edit'))code='purchases.edit_draft';if(r.path.includes('sales/:id/edit'))code='sales.edit_draft';if(r.path==='inventory/edit/:id')code='fabric_item.edit';if(r.path.endsWith('rolls/:id/edit'))code='fabric_roll.edit';if(r.path.endsWith('rolls/:id/move'))code='fabric_roll.move';if(code)permission(code);return {...r,required:code?[code]:[],note:r.demo?'VIEW_ONLY_DEMO_NO_OPERATIONAL_PERMISSIONS':'PAGE_ENTRY_ONLY_SERVER_POLICY_STILL_REQUIRED'};});
 const fieldNames={'inventory.cost.view':['عرض تكلفة المخزون','Stok maliyetini görüntüle'],'inventory.sale_price.view':['عرض أسعار البيع','Satış fiyatlarını görüntüle'],'financial.balances.view':['عرض الأرصدة والمبالغ المالية','Mali bakiye ve tutarları görüntüle'],'financial.profit.view':['عرض الربح والهامش','Kâr ve marjı görüntüle'],'payroll.salary.view':['عرض مبالغ الرواتب','Maaş tutarlarını görüntüle'],'employees.personal_data.view':['عرض بيانات الموظفين الشخصية','Personelin kişisel verilerini görüntüle'],'customers.contacts.view':['عرض معلومات اتصال العملاء','Müşteri iletişim bilgilerini görüntüle'],'suppliers.contacts.view':['عرض معلومات اتصال الموردين','Tedarikçi iletişim bilgilerini görüntüle'],'settings.secrets.manage':['إدارة أسرار التكامل دون عرضها الخام','Entegrasyon sırlarını ham olarak göstermeden yönet']};
 for(const[code,[ar,tr]]of Object.entries(fieldNames))catalog.get(code).description={ar,tr};
 return {schemaVersion:1,mode:'SHADOW_AUDIT_ONLY',sourceCounts:source.counts,permissions:[...catalog.values()].sort((a,b)=>a.code.localeCompare(b.code)),pages,policies:policyRows,
  task004Compatibility:{referenceCommit:'211683141a4f875cac5606062716ac46fdb4edf5',merged:false,keys:task004,rule:'Future explicit DENY must take precedence over all legacy/individual ALLOW sources; never UNION the old grants after evaluation.'},
  frameworkOptions:{method:'OPTIONS',kind:'PROTOCOL_ONLY',reason:'CORS preflight grants no business authorization; no route handler or existing guard is skipped.'}};
}
function writeArtifacts(data){
 fs.writeFileSync(path.join(__dirname,'permission-policy-manifest.json'),JSON.stringify(data,null,2)+'\n');
 const lines=['# TASK 005 Phase B — complete permission catalog and API matrix','','Generated from reviewed policy definitions and current source inspection. SHADOW ONLY.','','## Counts','',JSON.stringify(data.sourceCounts),'','## Permission catalog','','| Key | Section | Page | Operation | Arabic | Turkish | Status |','|---|---|---|---|---|---|---|'];
 const clean=v=>String(v).replaceAll('|','/').replaceAll('\n',' ');
 for(const p of data.permissions)lines.push('| '+[p.code,p.section,p.page,p.operation,p.description.ar,p.description.tr,p.status].map(clean).join(' | ')+' |');
 lines.push('','## All API policies','','All paths are templates. HEAD inherits the corresponding GET policy; OPTIONS is protocol-only, never a business bypass. Resource resolvers are declarations, not implemented database checks.','','| Method and path | Required permissions / variants | Company | Warehouse | Sensitive field permissions | Independent approval | Kind / resolver | Compound effects |','|---|---|---|---|---|---|---|---|');
 for(const p of data.policies)lines.push('| '+[p.id,p.c1Control?'C1 control: '+p.c1Control+' (legacy operation tags: '+p.required.join(', ')+')':[...p.required,p.variant?JSON.stringify(p.variant):'',...p.conditions.map(c=>c.when+': '+c.required.join('+'))].filter(Boolean).join(' + '),p.company,p.warehouse,p.sensitive.join(', '),p.approval.join(', '),p.kind+' / '+(p.resolver||'resource ownership still requires scope check'),p.compound.join(', ')].map(clean).join(' | ')+' |');
 lines.push('','## Frontend pages','','| Path | Component | Entry permissions | Demo |','|---|---|---|---|');for(const p of data.pages)lines.push('| '+[p.path,p.component,p.required.join(', '),p.demo?'YES: view only':'no'].map(clean).join(' | ')+' |');
 fs.writeFileSync(path.join(root,'TASK_005_PHASE_B_CATALOG_AND_API_MATRIX.md'),lines.join('\n')+'\n');
}
module.exports={build,writeArtifacts};
if(require.main===module){const data=build();writeArtifacts(data);console.log(JSON.stringify({counts:data.sourceCounts,permissions:data.permissions.length,policies:data.policies.length,public:data.policies.filter(p=>p.kind==='PUBLIC').length}));}
