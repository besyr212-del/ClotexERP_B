# TASK 005 Phase B — complete permission catalog and API matrix

Generated from reviewed policy definitions and current source inspection. SHADOW ONLY.

## Counts

{"apiDeclarations":393,"registeredApiRoutes":402,"routeFiles":50,"frontendRoutes":72,"reports":69}

## Permission catalog

| Key | Section | Page | Operation | Arabic | Turkish | Status |
|---|---|---|---|---|---|---|
| advances.approve | hr | /salaries | approve | اعتماد السلف | Ayrı onaylama — Avanslar | LEGACY |
| advances.create | hr | /salaries | create | إنشاء — السلف | Oluştur — Avanslar | PROPOSED |
| advances.manage | hr | /salaries | manage | إدارة السلف | Eski geniş yönetim — Avanslar | LEGACY |
| advances.view | hr | /salaries | view | عرض — السلف | Görüntüle — Avanslar | PROPOSED |
| ai.settings.manage | settings | /settings | settings.manage | إدارة قديمة واسعة — المساعد الذكي (settings.manage) | Eski geniş yönetim — Yapay zekâ asistanı (settings.manage) | PROPOSED |
| ai.settings.view | settings | /settings | settings.view | عرض — المساعد الذكي (settings.view) | Görüntüle — Yapay zekâ asistanı (settings.view) | PROPOSED |
| ai.test | settings | /settings | test | اختبار الاتصال — المساعد الذكي | Bağlantıyı dene — Yapay zekâ asistanı | PROPOSED |
| ai.use | settings | /settings | use | استخدام — المساعد الذكي | Kullan — Yapay zekâ asistanı | PROPOSED |
| appearance.manage | settings | /settings | manage | إدارة قديمة واسعة — المظهر | Eski geniş yönetim — Görünüm | PROPOSED |
| attendance.approve | hr | /hr/attendance | approve | اعتماد كشف الانتظام الشهري | Ayrı onaylama — Devam takibi | LEGACY |
| attendance.edit | hr | /hr/attendance | edit | تعديل — الحضور | Düzenle — Devam takibi | PROPOSED |
| attendance.import | hr | /hr/attendance | import | استيراد — الحضور | İçe aktar — Devam takibi | PROPOSED |
| attendance.manage | hr | /hr/attendance | manage | إدارة الحضور والانصراف | Eski geniş yönetim — Devam takibi | LEGACY |
| attendance.monthly_review.view | hr | /hr/attendance | monthly_review.view | عرض — الحضور (monthly_review.view) | Görüntüle — Devam takibi (monthly_review.view) | PROPOSED |
| attendance.view | hr | /hr/attendance | view | عرض — الحضور | Görüntüle — Devam takibi | PROPOSED |
| bulk_pricing.edit | inventory | /inventory/bulk-pricing | edit | تعديل — التسعير الجماعي | Düzenle — Toplu fiyatlandırma | PROPOSED |
| bulk_pricing.finalize_purchase | inventory | /inventory/bulk-pricing | finalize_purchase | إنهاء الشراء — التسعير الجماعي | Alışı tamamla — Toplu fiyatlandırma | PROPOSED |
| bulk_pricing.view | inventory | /inventory/bulk-pricing | view | عرض — التسعير الجماعي | Görüntüle — Toplu fiyatlandırma | PROPOSED |
| business_data.purge | settings | /settings | purge | حذف نهائي — مسح بيانات الشركة | Kalıcı sil — Şirket verilerini temizleme | PROPOSED |
| cartela_swatches.create | printing | /cartela | create | إنشاء — عينات الألوان | Oluştur — Renk numuneleri | PROPOSED |
| cartela_swatches.delete | printing | /cartela | delete | حذف — عينات الألوان | Sil — Renk numuneleri | PROPOSED |
| cartela_swatches.edit | printing | /cartela | edit | تعديل — عينات الألوان | Düzenle — Renk numuneleri | PROPOSED |
| cartela_swatches.view | printing | /cartela | view | عرض — عينات الألوان | Görüntüle — Renk numuneleri | PROPOSED |
| cartela.create | printing | /cartela | create | إنشاء — الكرتالة | Oluştur — Kartela | PROPOSED |
| cartela.delete | printing | /cartela | delete | حذف — الكرتالة | Sil — Kartela | PROPOSED |
| cartela.edit | printing | /cartela | edit | تعديل — الكرتالة | Düzenle — Kartela | PROPOSED |
| cartela.generate | printing | /cartela | generate | توليد — الكرتالة | Üret — Kartela | PROPOSED |
| cartela.view | printing | /cartela | view | عرض — الكرتالة | Görüntüle — Kartela | PROPOSED |
| cashbox_transfer.confirm | treasury | /treasury/safes | confirm | تأكيد مستقل — تحويلات الصناديق | Ayrı onay — Kasa transferleri | PROPOSED |
| cashbox_transfer.create | treasury | /treasury/safes | create | إنشاء — تحويلات الصناديق | Oluştur — Kasa transferleri | PROPOSED |
| cashbox_transfer.view | treasury | /treasury/safes | view | عرض — تحويلات الصناديق | Görüntüle — Kasa transferleri | PROPOSED |
| cashbox_transfer.void | treasury | /treasury/safes | void | إلغاء مستند مؤكد — تحويلات الصناديق | Onaylı belgeyi iptal et — Kasa transferleri | PROPOSED |
| cashboxes.adjust | treasury | /treasury/safes | adjust | تسوية رصيد — الصناديق | Bakiye düzelt — Kasalar | PROPOSED |
| cashboxes.create | treasury | /treasury/safes | create | إنشاء — الصناديق | Oluştur — Kasalar | PROPOSED |
| cashboxes.edit | treasury | /treasury/safes | edit | تعديل — الصناديق | Düzenle — Kasalar | PROPOSED |
| cashboxes.movements.view | treasury | /treasury/safes | movements.view | عرض — الصناديق (movements.view) | Görüntüle — Kasalar (movements.view) | PROPOSED |
| cashboxes.toggle_status | treasury | /treasury/safes | toggle_status | تفعيل وتعطيل — الصناديق | Etkinleştir veya durdur — Kasalar | PROPOSED |
| cashboxes.view | treasury | /treasury/safes | view | عرض — الصناديق | Görüntüle — Kasalar | PROPOSED |
| chart_of_accounts.view | finance | /chart-of-accounts | view | عرض — دليل الحسابات | Görüntüle — Hesap planı | PROPOSED |
| checks.clear | treasury | /treasury/checks-vault | clear | تحصيل — الشيكات | Tahsil et — Çekler | PROPOSED |
| checks.create | treasury | /treasury/checks-vault | create | إنشاء — الشيكات | Oluştur — Çekler | PROPOSED |
| checks.deposit | treasury | /treasury/checks-vault | deposit | إيداع — الشيكات | Bankaya yatır — Çekler | PROPOSED |
| checks.return | treasury | /treasury/checks-vault | return | إرجاع — الشيكات | Geri döndür — Çekler | PROPOSED |
| checks.view | treasury | /treasury/checks-vault | view | عرض — الشيكات | Görüntüle — Çekler | PROPOSED |
| customer_discount.approve | customers | /customers/statement | approve | اعتماد مستقل — حسم العميل | Ayrı onaylama — Müşteri indirimi | PROPOSED |
| customer_discount.cancel | customers | /customers/statement | cancel | إلغاء — حسم العميل | İptal — Müşteri indirimi | PROPOSED |
| customer_discount.create | customers | /customers/statement | create | إنشاء — حسم العميل | Oluştur — Müşteri indirimi | PROPOSED |
| customer_discount.view | customers | /customers/statement | view | عرض — حسم العميل | Görüntüle — Müşteri indirimi | PROPOSED |
| customer_legacy.import | customers | /customers/statement | import | استيراد — الأرشيف القديم | İçe aktar — Eski müşteri arşivi | TASK004_COMPAT |
| customer_legacy.review | customers | /customers/statement | review | مراجعة — الأرشيف القديم | İncele — Eski müşteri arşivi | TASK004_COMPAT |
| customer_orders.change_status | orders | /orders | change_status | تغيير الحالة — طلبيات العملاء | Durumu değiştir — Müşteri siparişleri | PROPOSED |
| customer_orders.create | orders | /orders | create | إنشاء — طلبيات العملاء | Oluştur — Müşteri siparişleri | PROPOSED |
| customer_orders.delete | orders | /orders | delete | حذف — طلبيات العملاء | Sil — Müşteri siparişleri | PROPOSED |
| customer_orders.edit | orders | /orders | edit | تعديل — طلبيات العملاء | Düzenle — Müşteri siparişleri | PROPOSED |
| customer_orders.import_preview | orders | /orders | import_preview | معاينة الاستيراد — طلبيات العملاء | İçe aktarımı önizle — Müşteri siparişleri | PROPOSED |
| customer_orders.view | orders | /orders | view | عرض — طلبيات العملاء | Görüntüle — Müşteri siparişleri | PROPOSED |
| customer_statement.export | customers | /customers/statement | export | تصدير — كشف العميل | Dışa aktar — Müşteri ekstresi | TASK004_COMPAT |
| customer_statement.financial_import | customers | /customers/statement | financial_import | استيراد كشف مالي — كشف العميل | Mali ekstreyi içe aktar — Müşteri ekstresi | PROPOSED |
| customer_statement.financial_import.post | customers | /customers/statement | financial_import.post | ترحيل مالي مستقل — كشف العميل (financial_import.post) | Ayrı mali kayıt — Müşteri ekstresi (financial_import.post) | PROPOSED |
| customer_statement.print | customers | /customers/statement | print | طباعة — كشف العميل | Yazdır — Müşteri ekstresi | PROPOSED |
| customer_statement.send | customers | /customers/statement | send | إرسال — كشف العميل | Gönder — Müşteri ekstresi | PROPOSED |
| customer_statement.view | customers | /customers/statement | view | عرض — كشف العميل | Görüntüle — Müşteri ekstresi | PROPOSED |
| customers.contacts.view | customers | /customers | contacts.view | عرض معلومات اتصال العملاء | Müşteri iletişim bilgilerini görüntüle | PROPOSED |
| customers.create | customers | /customers | create | إنشاء — العملاء | Oluştur — Müşteriler | PROPOSED |
| customers.create_from_supplier | customers | /customers | create_from_supplier | إنشاء من مورد — العملاء | Tedarikçiden oluştur — Müşteriler | PROPOSED |
| customers.edit | customers | /customers | edit | تعديل — العملاء | Düzenle — Müşteriler | PROPOSED |
| customers.manage | customers | /customers | manage | إدارة العملاء | Eski geniş yönetim — Müşteriler | LEGACY |
| customers.purge | customers | /customers | purge | حذف نهائي — العملاء | Kalıcı sil — Müşteriler | PROPOSED |
| customers.purge_preview | customers | /customers | purge_preview | معاينة الحذف النهائي — العملاء | Kalıcı silmeyi önizle — Müşteriler | PROPOSED |
| customers.toggle_status | customers | /customers | toggle_status | تفعيل وتعطيل — العملاء | Etkinleştir veya durdur — Müşteriler | PROPOSED |
| customers.view | customers | /customers | view | عرض العملاء | Görüntüle — Müşteriler | LEGACY |
| dashboard.view | dashboard | / | view | عرض لوحة التحكم | Görüntüle — Kontrol paneli | LEGACY |
| desktop.print_test | settings | /settings/desktop | print_test | طباعة اختبار — إعدادات سطح المكتب | Test yazdır — Masaüstü ayarları | PROPOSED |
| desktop.settings.manage | settings | /settings/desktop | settings.manage | إدارة قديمة واسعة — إعدادات سطح المكتب (settings.manage) | Eski geniş yönetim — Masaüstü ayarları (settings.manage) | PROPOSED |
| desktop.settings.view | settings | /settings/desktop | settings.view | عرض — إعدادات سطح المكتب (settings.view) | Görüntüle — Masaüstü ayarları (settings.view) | PROPOSED |
| documents.export | printing | /invoices/statement | export | تصدير — إصدار المستندات | Dışa aktar — Belge üretimi | PROPOSED |
| documents.send | printing | /invoices/statement | send | إرسال — إصدار المستندات | Gönder — Belge üretimi | PROPOSED |
| employee_wages.view | hr | /hr/employees | view | عرض — تاريخ الأجر | Görüntüle — Ücret geçmişi | PROPOSED |
| employees.create | hr | /hr/employees | create | إنشاء — ملفات الموظفين | Oluştur — Personel kayıtları | PROPOSED |
| employees.edit | hr | /hr/employees | edit | تعديل — ملفات الموظفين | Düzenle — Personel kayıtları | PROPOSED |
| employees.personal_data.view | hr | /hr/employees | personal_data.view | عرض بيانات الموظفين الشخصية | Personelin kişisel verilerini görüntüle | PROPOSED |
| employees.toggle_status | hr | /hr/employees | toggle_status | تفعيل وتعطيل — ملفات الموظفين | Etkinleştir veya durdur — Personel kayıtları | PROPOSED |
| employees.view | hr | /hr/employees | view | عرض — ملفات الموظفين | Görüntüle — Personel kayıtları | PROPOSED |
| exchange_invoices.view | demo | /invoices/exchange | view | عرض — المبادلات التجريبية | Görüntüle — Örnek değişim faturaları | PROPOSED |
| exchange_rate.approve | settings | /settings | approve | اعتماد مستقل — أسعار الصرف | Ayrı onaylama — Döviz kurları | TASK004_COMPAT |
| exchange_rate.manage | settings | /settings | manage | إدارة قديمة واسعة — أسعار الصرف | Eski geniş yönetim — Döviz kurları | TASK004_COMPAT |
| exchange_rate.view | settings | /settings | view | عرض — أسعار الصرف | Görüntüle — Döviz kurları | TASK004_COMPAT |
| expense_categories.view | treasury | /expenses | view | عرض — تصنيفات المصروف | Görüntüle — Gider kategorileri | PROPOSED |
| expenses.cancel | treasury | /expenses | cancel | إلغاء — المصروفات | İptal — Giderler | PROPOSED |
| expenses.confirm | treasury | /expenses | confirm | تأكيد مستقل — المصروفات | Ayrı onay — Giderler | PROPOSED |
| expenses.create | treasury | /expenses | create | إنشاء — المصروفات | Oluştur — Giderler | PROPOSED |
| expenses.view | treasury | /expenses | view | عرض — المصروفات | Görüntüle — Giderler | PROPOSED |
| external_job_matching.view | external_jobs | /purchases/external-job-matching | view | عرض — مطابقة المصنعية | Görüntüle — Dış imalat eşleştirme | PROPOSED |
| external_job.approve_shortage | external_jobs | /purchases/external-jobs | approve_shortage | اعتماد النقص — المصنعية الخارجية | Eksiği onayla — Dış imalat | PROPOSED |
| external_job.close | external_jobs | /purchases/external-jobs | close | إغلاق مهمة المصنعية — المصنعية الخارجية | Dış imalat işini kapat — Dış imalat | PROPOSED |
| external_job.confirm | external_jobs | /purchases/external-jobs | confirm | تأكيد مستقل — المصنعية الخارجية | Ayrı onay — Dış imalat | PROPOSED |
| external_job.create | external_jobs | /purchases/external-jobs | create | إنشاء — المصنعية الخارجية | Oluştur — Dış imalat | PROPOSED |
| external_job.edit_processing | external_jobs | /purchases/external-jobs | edit_processing | تعديل المعالجة — المصنعية الخارجية | İşlemeyi düzenle — Dış imalat | PROPOSED |
| external_job.post_fee | external_jobs | /purchases/external-jobs | post_fee | ترحيل الأجور — المصنعية الخارجية | Ücretleri muhasebeleştir — Dış imalat | PROPOSED |
| external_job.price | external_jobs | /purchases/external-jobs | price | تسعير — المصنعية الخارجية | Fiyatlandır — Dış imalat | PROPOSED |
| external_job.process | external_jobs | /purchases/external-jobs | process | معالجة — المصنعية الخارجية | İşle — Dış imalat | PROPOSED |
| external_job.receive | external_jobs | /purchases/external-jobs | receive | استلام — المصنعية الخارجية | Teslim al — Dış imalat | PROPOSED |
| external_job.record_fee | external_jobs | /purchases/external-jobs | record_fee | تسجيل أجور — المصنعية الخارجية | Ücretleri kaydet — Dış imalat | PROPOSED |
| external_job.resolve_defect | external_jobs | /purchases/external-jobs | resolve_defect | اعتماد قرار البضاعة المعيبة — المصنعية الخارجية | Kusurlu mal kararını onayla — Dış imalat | PROPOSED |
| external_job.view | external_jobs | /purchases/external-jobs | view | عرض — المصنعية الخارجية | Görüntüle — Dış imalat | PROPOSED |
| external_job.void | external_jobs | /purchases/external-jobs | void | إلغاء مستند مؤكد — المصنعية الخارجية | Onaylı belgeyi iptal et — Dış imalat | PROPOSED |
| external_job.void_processing | external_jobs | /purchases/external-jobs | void_processing | إلغاء المعالجة — المصنعية الخارجية | İşlemeyi iptal et — Dış imalat | PROPOSED |
| fabric_category.create | inventory | /inventory/categories | create | إنشاء — التصنيفات | Oluştur — Kategoriler | PROPOSED |
| fabric_category.edit | inventory | /inventory/categories | edit | تعديل — التصنيفات | Düzenle — Kategoriler | PROPOSED |
| fabric_category.sync | inventory | /inventory/categories | sync | مزامنة — التصنيفات | Eşitle — Kategoriler | PROPOSED |
| fabric_category.toggle_status | inventory | /inventory/categories | toggle_status | تفعيل وتعطيل — التصنيفات | Etkinleştir veya durdur — Kategoriler | PROPOSED |
| fabric_category.view | inventory | /inventory/categories | view | عرض — التصنيفات | Görüntüle — Kategoriler | PROPOSED |
| fabric_classification.resolve | inventory | /inventory/categories | resolve | حل أو إنشاء التصنيف — حل تصنيف الخامة | Sınıflandırmayı bul veya oluştur — Kumaş sınıflandırması | PROPOSED |
| fabric_color.create | inventory | /inventory/fabric-master-data | create | إنشاء — الألوان | Oluştur — Renkler | PROPOSED |
| fabric_color.edit | inventory | /inventory/fabric-master-data | edit | تعديل — الألوان | Düzenle — Renkler | PROPOSED |
| fabric_color.toggle_status | inventory | /inventory/fabric-master-data | toggle_status | تفعيل وتعطيل — الألوان | Etkinleştir veya durdur — Renkler | PROPOSED |
| fabric_color.view | inventory | /inventory/fabric-master-data | view | عرض — الألوان | Görüntüle — Renkler | PROPOSED |
| fabric_item.create | inventory | /inventory/create | create | إنشاء — الأصناف | Oluştur — Kumaş ürünleri | PROPOSED |
| fabric_item.edit | inventory | /inventory/create | edit | تعديل — الأصناف | Düzenle — Kumaş ürünleri | PROPOSED |
| fabric_item.toggle_status | inventory | /inventory/create | toggle_status | تفعيل وتعطيل — الأصناف | Etkinleştir veya durdur — Kumaş ürünleri | PROPOSED |
| fabric_item.view | inventory | /inventory/create | view | عرض — الأصناف | Görüntüle — Kumaş ürünleri | PROPOSED |
| fabric_roll.change_status | inventory | /inventory/rolls/:id | change_status | تغيير الحالة — الرولات | Durumu değiştir — Toplar | PROPOSED |
| fabric_roll.complete_fields | inventory | /inventory/rolls/:id | complete_fields | استكمال الحقول — الرولات | Alanları tamamla — Toplar | PROPOSED |
| fabric_roll.create | inventory | /inventory/rolls/:id | create | إنشاء — الرولات | Oluştur — Toplar | PROPOSED |
| fabric_roll.edit | inventory | /inventory/rolls/:id | edit | تعديل — الرولات | Düzenle — Toplar | PROPOSED |
| fabric_roll.move | inventory | /inventory/rolls/:id | move | نقل — الرولات | Taşı — Toplar | PROPOSED |
| fabric_roll.movements.view | inventory | /inventory/rolls/:id | movements.view | عرض — الرولات (movements.view) | Görüntüle — Toplar (movements.view) | PROPOSED |
| fabric_variant.create | inventory | /inventory/fabric-master-data | create | إنشاء — المتغيرات | Oluştur — Varyantlar | PROPOSED |
| fabric_variant.edit | inventory | /inventory/fabric-master-data | edit | تعديل — المتغيرات | Düzenle — Varyantlar | PROPOSED |
| fabric_variant.toggle_status | inventory | /inventory/fabric-master-data | toggle_status | تفعيل وتعطيل — المتغيرات | Etkinleştir veya durdur — Varyantlar | PROPOSED |
| fabric_variant.view | inventory | /inventory/fabric-master-data | view | عرض — المتغيرات | Görüntüle — Varyantlar | PROPOSED |
| fiber_types.create | printing | /cartela | create | إنشاء — أنواع الألياف | Oluştur — Elyaf türleri | PROPOSED |
| fiber_types.delete | printing | /cartela | delete | حذف — أنواع الألياف | Sil — Elyaf türleri | PROPOSED |
| fiber_types.view | printing | /cartela | view | عرض — أنواع الألياف | Görüntüle — Elyaf türleri | PROPOSED |
| financial_audit.run | finance | /reports | run | تنفيذ الفحص — التدقيق المالي | Denetimi çalıştır — Mali denetim | PROPOSED |
| financial_audit.view | finance | /reports | view | عرض — التدقيق المالي | Görüntüle — Mali denetim | PROPOSED |
| financial.balances.view | finance | /reports | balances.view | عرض الأرصدة والمبالغ المالية | Mali bakiye ve tutarları görüntüle | PROPOSED |
| financial.profit.view | finance | /reports | profit.view | عرض الربح والهامش | Kâr ve marjı görüntüle | PROPOSED |
| intake_dispatch.create_purchase_invoice | purchases | /inventory/intake-dispatch-slips | create_purchase_invoice | إنشاء فاتورة شراء مشتقة — أذون الاستلام والصرف | Bağlı alış faturası oluştur — Giriş çıkış fişleri | PROPOSED |
| intake_dispatch.edit | purchases | /inventory/intake-dispatch-slips | edit | تعديل — أذون الاستلام والصرف | Düzenle — Giriş çıkış fişleri | PROPOSED |
| intake_dispatch.view | purchases | /inventory/intake-dispatch-slips | view | عرض — أذون الاستلام والصرف | Görüntüle — Giriş çıkış fişleri | PROPOSED |
| intake_dispatch.void | purchases | /inventory/intake-dispatch-slips | void | إلغاء مستند مؤكد — أذون الاستلام والصرف | Onaylı belgeyi iptal et — Giriş çıkış fişleri | PROPOSED |
| intake_operation.create | purchases | /purchases/intake-operations/new | create | إنشاء — عمليات الاستلام | Oluştur — Mal kabul işlemleri | PROPOSED |
| intake_operation.finalize | purchases | /purchases/intake-operations/new | finalize | إنهاء — عمليات الاستلام | Tamamla — Mal kabul işlemleri | PROPOSED |
| intake_operation.view | purchases | /purchases/intake-operations/new | view | عرض — عمليات الاستلام | Görüntüle — Mal kabul işlemleri | PROPOSED |
| inventory_movements.view | inventory | /inventory/movements-log | view | عرض — حركات المخزون | Görüntüle — Stok hareketleri | PROPOSED |
| inventory_transfer.cancel | inventory | /inventory/transfers | cancel | إلغاء — المناقلات | İptal — Depo transferleri | PROPOSED |
| inventory_transfer.confirm | inventory | /inventory/transfers | confirm | تأكيد مستقل — المناقلات | Ayrı onay — Depo transferleri | PROPOSED |
| inventory_transfer.create | inventory | /inventory/transfers | create | إنشاء — المناقلات | Oluştur — Depo transferleri | PROPOSED |
| inventory_transfer.edit | inventory | /inventory/transfers | edit | تعديل — المناقلات | Düzenle — Depo transferleri | PROPOSED |
| inventory_transfer.view | inventory | /inventory/transfers | view | عرض — المناقلات | Görüntüle — Depo transferleri | PROPOSED |
| inventory_waste.cancel | inventory | /inventory/depreciation | cancel | إلغاء — الهالك | İptal — Fire | PROPOSED |
| inventory_waste.confirm | inventory | /inventory/depreciation | confirm | تأكيد مستقل — الهالك | Ayrı onay — Fire | PROPOSED |
| inventory_waste.create | inventory | /inventory/depreciation | create | إنشاء — الهالك | Oluştur — Fire | PROPOSED |
| inventory_waste.edit | inventory | /inventory/depreciation | edit | تعديل — الهالك | Düzenle — Fire | PROPOSED |
| inventory_waste.view | inventory | /inventory/depreciation | view | عرض — الهالك | Görüntüle — Fire | PROPOSED |
| inventory.cost.view | inventory | /inventory | cost.view | عرض تكلفة المخزون | Stok maliyetini görüntüle | PROPOSED |
| inventory.manage | inventory | /inventory | manage | إدارة المخزون | Eski geniş yönetim — Stok | LEGACY |
| inventory.sale_price.view | inventory | /inventory | sale_price.view | عرض أسعار البيع | Satış fiyatlarını görüntüle | PROPOSED |
| inventory.settings.manage | inventory | /inventory | settings.manage | إدارة قديمة واسعة — المخزون (settings.manage) | Eski geniş yönetim — Stok (settings.manage) | PROPOSED |
| inventory.settings.view | inventory | /inventory | settings.view | عرض — المخزون (settings.view) | Görüntüle — Stok (settings.view) | PROPOSED |
| inventory.view | inventory | /inventory | view | عرض المخزون | Görüntüle — Stok | LEGACY |
| invoice_statement.export | sales | /invoices/statement | export | تصدير — كشف الفاتورة | Dışa aktar — Fatura ekstresi | PROPOSED |
| invoice_statement.print | sales | /invoices/statement | print | طباعة — كشف الفاتورة | Yazdır — Fatura ekstresi | PROPOSED |
| invoice_statement.view | sales | /invoices/statement | view | عرض — كشف الفاتورة | Görüntüle — Fatura ekstresi | PROPOSED |
| journal.create | finance | /journal | create | إنشاء — القيود اليدوية | Oluştur — Manuel yevmiye | PROPOSED |
| journal.post | finance | /journal | post | ترحيل مالي مستقل — القيود اليدوية | Ayrı mali kayıt — Manuel yevmiye | PROPOSED |
| journal.view | finance | /journal | view | عرض — القيود اليدوية | Görüntüle — Manuel yevmiye | PROPOSED |
| label_template.view | printing | /inventory/labels | view | عرض — قوالب اللصاقات | Görüntüle — Etiket şablonları | PROPOSED |
| labels.custom.print | printing | /inventory/labels | custom.print | طباعة — اللصاقات (custom.print) | Yazdır — Etiketler (custom.print) | PROPOSED |
| labels.custom.view | printing | /inventory/labels | custom.view | عرض — اللصاقات (custom.view) | Görüntüle — Etiketler (custom.view) | PROPOSED |
| labels.preview | printing | /inventory/labels | preview | معاينة — اللصاقات | Önizle — Etiketler | PROPOSED |
| labels.print | printing | /inventory/labels | print | طباعة — اللصاقات | Yazdır — Etiketler | PROPOSED |
| manufacturing.view | demo | /manufacturing | view | عرض — المصنعية الداخلية التجريبية | Görüntüle — Örnek iç imalat | PROPOSED |
| order_templates.create | orders | /orders | create | إنشاء — قوالب الطلبيات | Oluştur — Sipariş şablonları | PROPOSED |
| order_templates.delete | orders | /orders | delete | حذف — قوالب الطلبيات | Sil — Sipariş şablonları | PROPOSED |
| order_templates.view | orders | /orders | view | عرض — قوالب الطلبيات | Görüntüle — Sipariş şablonları | PROPOSED |
| partners.view | demo | /partners | view | عرض — الشركاء التجريبيون | Görüntüle — Örnek iş ortakları | PROPOSED |
| party_activity.create | parties | /customers/log | create | إنشاء — سجلات الأطراف | Oluştur — Cari hareket kayıtları | PROPOSED |
| party_activity.view | parties | /customers/log | view | عرض — سجلات الأطراف | Görüntüle — Cari hareket kayıtları | PROPOSED |
| payment_voucher.cancel | treasury | /bonds/payment | cancel | إلغاء — سندات الصرف | İptal — Ödeme fişleri | PROPOSED |
| payment_voucher.confirm | treasury | /bonds/payment | confirm | تأكيد مستقل — سندات الصرف | Ayrı onay — Ödeme fişleri | PROPOSED |
| payment_voucher.create | treasury | /bonds/payment | create | إنشاء — سندات الصرف | Oluştur — Ödeme fişleri | PROPOSED |
| payment_voucher.edit | treasury | /bonds/payment | edit | تعديل — سندات الصرف | Düzenle — Ödeme fişleri | PROPOSED |
| payment_voucher.view | treasury | /bonds/payment | view | عرض — سندات الصرف | Görüntüle — Ödeme fişleri | PROPOSED |
| payroll_audit.view | hr | /salaries/log | view | عرض — تدقيق الرواتب | Görüntüle — Bordro denetimi | PROPOSED |
| payroll_log.view | hr | /salaries/log | view | عرض — سجل الرواتب | Görüntüle — Bordro kayıtları | PROPOSED |
| payroll.approve | hr | /salaries | approve | اعتماد كشوف الرواتب | Ayrı onaylama — Bordro | LEGACY |
| payroll.cancel | hr | /salaries | cancel | إلغاء — الرواتب | İptal — Bordro | PROPOSED |
| payroll.create | hr | /salaries | create | إنشاء — الرواتب | Oluştur — Bordro | PROPOSED |
| payroll.disburse | hr | /salaries | disburse | صرف الرواتب | Ayrı ödeme — Bordro | LEGACY |
| payroll.edit | hr | /salaries | edit | تعديل — الرواتب | Düzenle — Bordro | PROPOSED |
| payroll.import | hr | /salaries | import | استيراد — الرواتب | İçe aktar — Bordro | PROPOSED |
| payroll.manage | hr | /salaries | manage | إدارة الرواتب | Eski geniş yönetim — Bordro | LEGACY |
| payroll.salary.view | hr | /salaries | salary.view | عرض مبالغ الرواتب | Maaş tutarlarını görüntüle | PROPOSED |
| payroll.view | hr | /salaries | view | عرض الرواتب | Görüntüle — Bordro | LEGACY |
| platform.activation.generate | platform | /settings | activation.generate | توليد — إدارة المنصة (activation.generate) | Üret — Platform yönetimi (activation.generate) | PROPOSED |
| platform.activation.revoke | platform | /settings | activation.revoke | سحب التفويض — إدارة المنصة (activation.revoke) | Yetkiyi geri al — Platform yönetimi (activation.revoke) | PROPOSED |
| platform.activation.view | platform | /settings | activation.view | عرض — إدارة المنصة (activation.view) | Görüntüle — Platform yönetimi (activation.view) | PROPOSED |
| platform.backup.download | platform | /settings | backup.download | تنزيل النسخة الكاملة للمنصة — إدارة المنصة (backup.download) | Tam platform yedeğini indir — Platform yönetimi (backup.download) | PROPOSED |
| platform.companies.create | platform | /settings | companies.create | إنشاء — إدارة المنصة (companies.create) | Oluştur — Platform yönetimi (companies.create) | PROPOSED |
| platform.companies.edit | platform | /settings | companies.edit | تعديل — إدارة المنصة (companies.edit) | Düzenle — Platform yönetimi (companies.edit) | PROPOSED |
| platform.companies.switch | platform | /settings | companies.switch | التبديل بين الشركات — إدارة المنصة (companies.switch) | Şirketler arasında geçiş yap — Platform yönetimi (companies.switch) | PROPOSED |
| platform.companies.view | platform | /settings | companies.view | عرض — إدارة المنصة (companies.view) | Görüntüle — Platform yönetimi (companies.view) | PROPOSED |
| platform.roles.manage | platform | /settings | roles.manage | إدارة قديمة واسعة — إدارة المنصة (roles.manage) | Eski geniş yönetim — Platform yönetimi (roles.manage) | PROPOSED |
| preparation_types.create | external_jobs | /purchases/external-jobs | create | إنشاء — أنواع التجهيز | Oluştur — Hazırlık türleri | PROPOSED |
| preparation_types.edit | external_jobs | /purchases/external-jobs | edit | تعديل — أنواع التجهيز | Düzenle — Hazırlık türleri | PROPOSED |
| preparation_types.view | external_jobs | /purchases/external-jobs | view | عرض — أنواع التجهيز | Görüntüle — Hazırlık türleri | PROPOSED |
| print_jobs.update_status | printing | /inventory/print-jobs | update_status | تحديث الحالة — مهام الطباعة | Durumu güncelle — Yazdırma işleri | PROPOSED |
| print_jobs.view | printing | /inventory/print-jobs | view | عرض — مهام الطباعة | Görüntüle — Yazdırma işleri | PROPOSED |
| purchase_import.cancel | purchases | /purchases/import-excel | cancel | إلغاء — استيراد الشراء | İptal — Alış içe aktarımı | PROPOSED |
| purchase_import.confirm | purchases | /purchases/import-excel | confirm | تأكيد مستقل — استيراد الشراء | Ayrı onay — Alış içe aktarımı | PROPOSED |
| purchase_import.preview | purchases | /purchases/import-excel | preview | معاينة — استيراد الشراء | Önizle — Alış içe aktarımı | PROPOSED |
| purchase_import.scan_verify | purchases | /purchases/import-excel | scan_verify | التحقق بالمسح — استيراد الشراء | Tarayarak doğrula — Alış içe aktarımı | PROPOSED |
| purchase_import.view | purchases | /purchases/import-excel | view | عرض — استيراد الشراء | Görüntüle — Alış içe aktarımı | PROPOSED |
| purchase_return.cancel | purchases | /invoices/returns | cancel | إلغاء — مرتجعات الشراء | İptal — Alış iadeleri | PROPOSED |
| purchase_return.confirm | purchases | /invoices/returns | confirm | تأكيد مستقل — مرتجعات الشراء | Ayrı onay — Alış iadeleri | PROPOSED |
| purchase_return.create | purchases | /invoices/returns | create | إنشاء — مرتجعات الشراء | Oluştur — Alış iadeleri | PROPOSED |
| purchase_return.edit | purchases | /invoices/returns | edit | تعديل — مرتجعات الشراء | Düzenle — Alış iadeleri | PROPOSED |
| purchase_return.view | purchases | /invoices/returns | view | عرض — مرتجعات الشراء | Görüntüle — Alış iadeleri | PROPOSED |
| purchases.confirm | purchases | /invoices/purchases | confirm | تأكيد مستقل — فواتير الشراء | Ayrı onay — Alış faturaları | PROPOSED |
| purchases.create | purchases | /invoices/purchases | create | إنشاء — فواتير الشراء | Oluştur — Alış faturaları | PROPOSED |
| purchases.delete_draft | purchases | /invoices/purchases | delete_draft | حذف المسودة — فواتير الشراء | Taslağı sil — Alış faturaları | PROPOSED |
| purchases.edit_confirmed | purchases | /invoices/purchases | edit_confirmed | تعديل المؤكد — فواتير الشراء | Onaylı kaydı düzenle — Alış faturaları | PROPOSED |
| purchases.edit_draft | purchases | /invoices/purchases | edit_draft | تعديل المسودة — فواتير الشراء | Taslağı düzenle — Alış faturaları | PROPOSED |
| purchases.manage | purchases | /invoices/purchases | manage | إدارة المشتريات | Eski geniş yönetim — Alış faturaları | LEGACY |
| purchases.purge_voided | purchases | /invoices/purchases | purge_voided | حذف الملغى نهائياً — فواتير الشراء | İptal edilmiş belgeyi kalıcı sil — Alış faturaları | PROPOSED |
| purchases.repair_rolls | purchases | /invoices/purchases | repair_rolls | إصلاح الرولات — فواتير الشراء | Topları onar — Alış faturaları | PROPOSED |
| purchases.view | purchases | /invoices/purchases | view | عرض المشتريات | Görüntüle — Alış faturaları | LEGACY |
| purchases.void | purchases | /invoices/purchases | void | إلغاء مستند مؤكد — فواتير الشراء | Onaylı belgeyi iptal et — Alış faturaları | PROPOSED |
| receipt_voucher.cancel | treasury | /bonds/collection | cancel | إلغاء — سندات القبض | İptal — Tahsilat fişleri | PROPOSED |
| receipt_voucher.confirm | treasury | /bonds/collection | confirm | تأكيد مستقل — سندات القبض | Ayrı onay — Tahsilat fişleri | PROPOSED |
| receipt_voucher.create | treasury | /bonds/collection | create | إنشاء — سندات القبض | Oluştur — Tahsilat fişleri | PROPOSED |
| receipt_voucher.edit | treasury | /bonds/collection | edit | تعديل — سندات القبض | Düzenle — Tahsilat fişleri | PROPOSED |
| receipt_voucher.view | treasury | /bonds/collection | view | عرض — سندات القبض | Görüntüle — Tahsilat fişleri | PROPOSED |
| reports.cashbox_summary.view | reports | /reports | cashbox_summary.view | عرض تقرير — ملخص الصناديق | Raporu görüntüle — Kasa özeti | PROPOSED |
| reports.customers.activity.view | reports | /reports | customers.activity.view | عرض تقرير — نشاط العملاء فقط | Raporu görüntüle — Sadece Müşteri Faaliyeti | PROPOSED |
| reports.customers.aging.view | reports | /reports | customers.aging.view | عرض تقرير — أعمار ديون العملاء | Raporu görüntüle — Müşteri Borç Yaşlandırması | PROPOSED |
| reports.customers.by_status.view | reports | /reports | customers.by_status.view | عرض تقرير — العملاء حسب الحالة | Raporu görüntüle — Duruma Göre Müşteriler | PROPOSED |
| reports.customers.statement.view | reports | /reports | customers.statement.view | عرض تقرير — كشف حساب عميل | Raporu görüntüle — Müşteri Hesap Ekstresi | PROPOSED |
| reports.customers.summary.view | reports | /reports | customers.summary.view | عرض تقرير — ملخص تعاملات العملاء | Raporu görüntüle — Müşteri İşlemleri Özeti | PROPOSED |
| reports.dashboard_summary.view | reports | /reports | dashboard_summary.view | عرض تقرير — ملخص لوحة التحكم | Raporu görüntüle — Kontrol paneli özeti | PROPOSED |
| reports.executive.summary_report.view | reports | /reports | executive.summary_report.view | عرض تقرير — التقرير التنفيذي الموحّد | Raporu görüntüle — Birleşik Yönetici Raporu | PROPOSED |
| reports.export | reports | /reports | export | تصدير — التقارير | Dışa aktar — Raporlar | PROPOSED |
| reports.financial.account_activity.view | reports | /reports | financial.account_activity.view | عرض تقرير — تقرير حركة الحساب المخصص | Raporu görüntüle — Özel Hesap Hareketi Raporu | PROPOSED |
| reports.financial.cash_flow.view | reports | /reports | financial.cash_flow.view | عرض تقرير — التدفقات النقدية | Raporu görüntüle — Nakit akışı | PROPOSED |
| reports.financial.cashbox_movements.view | reports | /reports | financial.cashbox_movements.view | عرض تقرير — حركة الصندوق | Raporu görüntüle — Kasa Hareketi | PROPOSED |
| reports.financial.cashboxes.view | reports | /reports | financial.cashboxes.view | عرض تقرير — أرصدة الصناديق | Raporu görüntüle — Kasa Bakiyeleri | PROPOSED |
| reports.financial.currency_differences.view | reports | /reports | financial.currency_differences.view | عرض تقرير — تعرّض العملات | Raporu görüntüle — Döviz Riski | PROPOSED |
| reports.financial.operational_balance_summary.view | reports | /reports | financial.operational_balance_summary.view | عرض تقرير — ملخص الأرصدة التشغيلية | Raporu görüntüle — Operasyonel bakiye özeti | PROPOSED |
| reports.financial.operational_income_expense.view | reports | /reports | financial.operational_income_expense.view | عرض تقرير — الإيرادات والمصروفات التشغيلية | Raporu görüntüle — Operasyonel gelir ve giderler | PROPOSED |
| reports.financial.operational_ledger.view | reports | /reports | financial.operational_ledger.view | عرض تقرير — دفتر العمليات | Raporu görüntüle — İşlem defteri | PROPOSED |
| reports.financial.operational_position.view | reports | /reports | financial.operational_position.view | عرض تقرير — المركز المالي التشغيلي | Raporu görüntüle — Operasyonel mali durum | PROPOSED |
| reports.financial.profit_details.view | reports | /reports | financial.profit_details.view | عرض تقرير — تفاصيل الأرباح | Raporu görüntüle — Kâr ayrıntıları | PROPOSED |
| reports.financial.receipts_payments.view | reports | /reports | financial.receipts_payments.view | عرض تقرير — ملخص المقبوضات والمدفوعات | Raporu görüntüle — Tahsilat ve Ödeme Özeti | PROPOSED |
| reports.financial.vouchers.view | reports | /reports | financial.vouchers.view | عرض تقرير — سجل السندات | Raporu görüntüle — Fiş Kayıtları | PROPOSED |
| reports.inventory_summary.view | reports | /reports | inventory_summary.view | عرض تقرير — ملخص المخزون | Raporu görüntüle — Stok özeti | PROPOSED |
| reports.inventory.aging.view | reports | /reports | inventory.aging.view | عرض تقرير — أعمار المخزون | Raporu görüntüle — Stok Yaşlandırması | PROPOSED |
| reports.inventory.balances.view | reports | /reports | inventory.balances.view | عرض تقرير — أرصدة المخزون | Raporu görüntüle — Stok Bakiyeleri | PROPOSED |
| reports.inventory.batch_tracking.view | reports | /reports | inventory.batch_tracking.view | عرض تقرير — تتبع الدفعات | Raporu görüntüle — Parti Takibi | PROPOSED |
| reports.inventory.by_color.view | reports | /reports | inventory.by_color.view | عرض تقرير — المخزون حسب اللون | Raporu görüntüle — Renge Göre Stok | PROPOSED |
| reports.inventory.by_item_color.view | reports | /reports | inventory.by_item_color.view | عرض تقرير — الأدواب حسب الخامة واللون | Raporu görüntüle — Kumaş Türü ve Renge Göre Toplar | PROPOSED |
| reports.inventory.by_warehouse.view | reports | /reports | inventory.by_warehouse.view | عرض تقرير — الأدواب حسب المستودع | Raporu görüntüle — Depoya Göre Toplar | PROPOSED |
| reports.inventory.cutting_efficiency.view | reports | /reports | inventory.cutting_efficiency.view | عرض تقرير — كفاءة القص | Raporu görüntüle — Kesim Verimliliği | PROPOSED |
| reports.inventory.damaged_stock.view | reports | /reports | inventory.damaged_stock.view | عرض تقرير — المخزون التالف | Raporu görüntüle — Hasarlı stok | PROPOSED |
| reports.inventory.fabric_types.view | reports | /reports | inventory.fabric_types.view | عرض تقرير — أنواع الأقمشة | Raporu görüntüle — Kumaş Türleri | PROPOSED |
| reports.inventory.movements.view | reports | /reports | inventory.movements.view | عرض تقرير — حركة الأتواب | Raporu görüntüle — Top Hareketleri | PROPOSED |
| reports.inventory.negative_stock.view | reports | /reports | inventory.negative_stock.view | عرض تقرير — المخزون السالب | Raporu görüntüle — Negatif stok | PROPOSED |
| reports.inventory.remaining_lengths.view | reports | /reports | inventory.remaining_lengths.view | عرض تقرير — الأطوال المتبقية | Raporu görüntüle — Kalan Uzunluklar | PROPOSED |
| reports.inventory.roll_level.view | reports | /reports | inventory.roll_level.view | عرض تقرير — المخزون على مستوى الطاقة | Raporu görüntüle — Top Seviyesinde Stok | PROPOSED |
| reports.inventory.rolls.view | reports | /reports | inventory.rolls.view | عرض تقرير — كشف أتواب المخزون | Raporu görüntüle — Stok Topları Dökümü | PROPOSED |
| reports.inventory.slow_moving.view | reports | /reports | inventory.slow_moving.view | عرض تقرير — أصناف بطيئة الحركة | Raporu görüntüle — Hareketi Yavaş Kalemler | PROPOSED |
| reports.inventory.valuation.view | reports | /reports | inventory.valuation.view | عرض تقرير — تقييم المخزون | Raporu görüntüle — Stok Değerlemesi | PROPOSED |
| reports.inventory.waste_analysis.view | reports | /reports | inventory.waste_analysis.view | عرض تقرير — ملخص سجلات التوالف | Raporu görüntüle — Fire Kayıtları Özeti | PROPOSED |
| reports.parties.activity.view | reports | /reports | parties.activity.view | عرض تقرير — نشاط العملاء والموردين | Raporu görüntüle — Müşteri ve Tedarikçi Faaliyeti | PROPOSED |
| reports.payroll_summary.view | reports | /reports | payroll_summary.view | عرض تقرير — ملخص الرواتب | Raporu görüntüle — Maaş özeti | PROPOSED |
| reports.payroll.employees.view | reports | /reports | payroll.employees.view | عرض تقرير — قائمة الموظفين | Raporu görüntüle — Personel Listesi | PROPOSED |
| reports.payroll.monthly_summary.view | reports | /reports | payroll.monthly_summary.view | عرض تقرير — ملخص رواتب شهري | Raporu görüntüle — Aylık Bordro Özeti | PROPOSED |
| reports.payroll.runs_list.view | reports | /reports | payroll.runs_list.view | عرض تقرير — مسيرات الرواتب | Raporu görüntüle — Bordro Dönemleri | PROPOSED |
| reports.payroll.summary.view | reports | /reports | payroll.summary.view | عرض تقرير — ملخص الرواتب | Raporu görüntüle — Maaş özeti | PROPOSED |
| reports.print | reports | /reports | print | طباعة — التقارير | Yazdır — Raporlar | PROPOSED |
| reports.printing.jobs.view | reports | /reports | printing.jobs.view | عرض تقرير — سجل مهام الطباعة | Raporu görüntüle — Baskı İşleri Kaydı | PROPOSED |
| reports.printing.printed_labels.view | reports | /reports | printing.printed_labels.view | عرض تقرير — اللصاقات المطبوعة | Raporu görüntüle — Basılan Etiketler | PROPOSED |
| reports.printing.unprinted_rolls.view | reports | /reports | printing.unprinted_rolls.view | عرض تقرير — أدواب بدون لصاقة | Raporu görüntüle — Etiketsiz Toplar | PROPOSED |
| reports.purchases.by_batch.view | reports | /reports | purchases.by_batch.view | عرض تقرير — المشتريات حسب الدفعة/اللوط | Raporu görüntüle — Partiye/Lota Göre Satın Almalar | PROPOSED |
| reports.purchases.by_item.view | reports | /reports | purchases.by_item.view | عرض تقرير — المشتريات حسب الصنف | Raporu görüntüle — Kaleme Göre Satın Almalar | PROPOSED |
| reports.purchases.by_supplier.view | reports | /reports | purchases.by_supplier.view | عرض تقرير — المشتريات حسب المورد | Raporu görüntüle — Tedarikçiye Göre Satın Almalar | PROPOSED |
| reports.purchases.cost_trend.view | reports | /reports | purchases.cost_trend.view | عرض تقرير — اتجاه التكلفة | Raporu görüntüle — Maliyet Eğilimi | PROPOSED |
| reports.purchases.details.view | reports | /reports | purchases.details.view | عرض تقرير — المشتريات التفصيلية | Raporu görüntüle — Detaylı Satın Almalar | PROPOSED |
| reports.purchases.import_batches.view | reports | /reports | purchases.import_batches.view | عرض تقرير — سجل دفعات استيراد Excel | Raporu görüntüle — Excel İçe Aktarma Parti Kaydı | PROPOSED |
| reports.purchases.import_rows.view | reports | /reports | purchases.import_rows.view | عرض تقرير — صفوف دفعة الاستيراد | Raporu görüntüle — İçe Aktarma Partisi Satırları | PROPOSED |
| reports.purchases.summary.view | reports | /reports | purchases.summary.view | عرض تقرير — ملخص المشتريات | Raporu görüntüle — Satın Alma Özeti | PROPOSED |
| reports.sales.by_agent.view | reports | /reports | sales.by_agent.view | عرض تقرير — المبيعات حسب المندوب | Raporu görüntüle — Temsilciye Göre Satışlar | PROPOSED |
| reports.sales.by_color.view | reports | /reports | sales.by_color.view | عرض تقرير — المبيعات حسب اللون | Raporu görüntüle — Renge Göre Satışlar | PROPOSED |
| reports.sales.by_customer.view | reports | /reports | sales.by_customer.view | عرض تقرير — المبيعات حسب العميل | Raporu görüntüle — Müşteriye Göre Satışlar | PROPOSED |
| reports.sales.by_item_color.view | reports | /reports | sales.by_item_color.view | عرض تقرير — المبيعات حسب الخامة واللون | Raporu görüntüle — Kumaş ve renge göre satışlar | PROPOSED |
| reports.sales.by_item.view | reports | /reports | sales.by_item.view | عرض تقرير — المبيعات حسب الصنف | Raporu görüntüle — Kaleme Göre Satışlar | PROPOSED |
| reports.sales.details.view | reports | /reports | sales.details.view | عرض تقرير — المبيعات التفصيلية | Raporu görüntüle — Detaylı Satışlar | PROPOSED |
| reports.sales.margins.view | reports | /reports | sales.margins.view | عرض تقرير — تحليل هوامش الربح | Raporu görüntüle — Kâr Marjı Analizi | PROPOSED |
| reports.sales.summary.view | reports | /reports | sales.summary.view | عرض تقرير — ملخص المبيعات | Raporu görüntüle — Satış Özeti | PROPOSED |
| reports.sold_materials.view | reports | /reports | sold_materials.view | عرض تقرير — الخامات المباعة | Raporu görüntüle — Satılan kumaşlar | PROPOSED |
| reports.suppliers.activity.view | reports | /reports | suppliers.activity.view | عرض تقرير — نشاط الموردين | Raporu görüntüle — Tedarikçi Faaliyeti | PROPOSED |
| reports.suppliers.aging.view | reports | /reports | suppliers.aging.view | عرض تقرير — أعمار ذمم الموردين | Raporu görüntüle — Tedarikçi Borç Yaşlandırması | PROPOSED |
| reports.suppliers.by_status.view | reports | /reports | suppliers.by_status.view | عرض تقرير — الموردون حسب الحالة | Raporu görüntüle — Duruma Göre Tedarikçiler | PROPOSED |
| reports.suppliers.statement.view | reports | /reports | suppliers.statement.view | عرض تقرير — كشف حساب مورد | Raporu görüntüle — Tedarikçi Hesap Ekstresi | PROPOSED |
| reports.suppliers.summary.view | reports | /reports | suppliers.summary.view | عرض تقرير — ملخص تعاملات الموردين | Raporu görüntüle — Tedarikçi İşlemleri Özeti | PROPOSED |
| reports.view | reports | /reports | view | عرض التقارير | Görüntüle — Raporlar | LEGACY |
| reports.vouchers_summary.view | reports | /reports | vouchers_summary.view | عرض تقرير — ملخص السندات | Raporu görüntüle — Makbuz özeti | PROPOSED |
| sales_return.cancel | sales | /invoices/returns | cancel | إلغاء — مرتجعات البيع | İptal — Satış iadeleri | PROPOSED |
| sales_return.confirm | sales | /invoices/returns | confirm | تأكيد مستقل — مرتجعات البيع | Ayrı onay — Satış iadeleri | PROPOSED |
| sales_return.create | sales | /invoices/returns | create | إنشاء — مرتجعات البيع | Oluştur — Satış iadeleri | PROPOSED |
| sales_return.edit | sales | /invoices/returns | edit | تعديل — مرتجعات البيع | Düzenle — Satış iadeleri | PROPOSED |
| sales_return.view | sales | /invoices/returns | view | عرض — مرتجعات البيع | Görüntüle — Satış iadeleri | PROPOSED |
| sales.confirm | sales | /invoices/sales | confirm | تأكيد مستقل — فواتير البيع | Ayrı onay — Satış faturaları | PROPOSED |
| sales.create | sales | /invoices/sales | create | إنشاء — فواتير البيع | Oluştur — Satış faturaları | PROPOSED |
| sales.delete_draft | sales | /invoices/sales | delete_draft | حذف المسودة — فواتير البيع | Taslağı sil — Satış faturaları | PROPOSED |
| sales.edit_confirmed | sales | /invoices/sales | edit_confirmed | تعديل المؤكد — فواتير البيع | Onaylı kaydı düzenle — Satış faturaları | PROPOSED |
| sales.edit_draft | sales | /invoices/sales | edit_draft | تعديل المسودة — فواتير البيع | Taslağı düzenle — Satış faturaları | PROPOSED |
| sales.view | sales | /invoices/sales | view | عرض — فواتير البيع | Görüntüle — Satış faturaları | PROPOSED |
| sales.void | sales | /invoices/sales | void | إلغاء مستند مؤكد — فواتير البيع | Onaylı belgeyi iptal et — Satış faturaları | PROPOSED |
| sessions.revoke | settings | /settings | revoke | سحب التفويض — الجلسات | Yetkiyi geri al — Oturumlar | PROPOSED |
| sessions.view | settings | /settings | view | عرض — الجلسات | Görüntüle — Oturumlar | PROPOSED |
| settings.manage | settings | /settings | manage | إدارة الإعدادات | Eski geniş yönetim — Ayarlar | LEGACY |
| settings.secrets.manage | settings | /settings | secrets.manage | إدارة أسرار التكامل دون عرضها الخام | Entegrasyon sırlarını ham olarak göstermeden yönet | PROPOSED |
| settings.view | settings | /settings | view | عرض الإعدادات | Görüntüle — Ayarlar | LEGACY |
| shift_types.create | hr | /hr/attendance | create | إنشاء — الورديات | Oluştur — Vardiyalar | PROPOSED |
| shift_types.view | hr | /hr/attendance | view | عرض — الورديات | Görüntüle — Vardiyalar | PROPOSED |
| stock_import.create | inventory | /inventory | create | إنشاء — استيراد المخزون | Oluştur — Stok içe aktarımı | PROPOSED |
| stock_import.view_status | inventory | /inventory | view_status | متابعة الحالة — استيراد المخزون | Durumu izle — Stok içe aktarımı | PROPOSED |
| supplier_statement.export | suppliers | /suppliers/statement | export | تصدير — كشف المورد | Dışa aktar — Tedarikçi ekstresi | PROPOSED |
| supplier_statement.print | suppliers | /suppliers/statement | print | طباعة — كشف المورد | Yazdır — Tedarikçi ekstresi | PROPOSED |
| supplier_statement.send | suppliers | /suppliers/statement | send | إرسال — كشف المورد | Gönder — Tedarikçi ekstresi | PROPOSED |
| supplier_statement.view | suppliers | /suppliers/statement | view | عرض — كشف المورد | Görüntüle — Tedarikçi ekstresi | PROPOSED |
| suppliers.contacts.view | suppliers | /suppliers | contacts.view | عرض معلومات اتصال الموردين | Tedarikçi iletişim bilgilerini görüntüle | PROPOSED |
| suppliers.create | suppliers | /suppliers | create | إنشاء — الموردون | Oluştur — Tedarikçiler | PROPOSED |
| suppliers.edit | suppliers | /suppliers | edit | تعديل — الموردون | Düzenle — Tedarikçiler | PROPOSED |
| suppliers.manage | suppliers | /suppliers | manage | إدارة الموردين | Eski geniş yönetim — Tedarikçiler | LEGACY |
| suppliers.toggle_status | suppliers | /suppliers | toggle_status | تفعيل وتعطيل — الموردون | Etkinleştir veya durdur — Tedarikçiler | PROPOSED |
| suppliers.view | suppliers | /suppliers | view | عرض الموردين | Görüntüle — Tedarikçiler | LEGACY |
| telegram.manage | settings | /settings | manage | إدارة قديمة واسعة — Telegram | Eski geniş yönetim — Telegram | PROPOSED |
| telegram.send | settings | /settings | send | إرسال — Telegram | Gönder — Telegram | PROPOSED |
| telegram.test | settings | /settings | test | اختبار الاتصال — Telegram | Bağlantıyı dene — Telegram | PROPOSED |
| telegram.view | settings | /settings | view | عرض — Telegram | Görüntüle — Telegram | PROPOSED |
| users.create | settings | /settings | create | إنشاء — المستخدمون | Oluştur — Kullanıcılar | PROPOSED |
| users.edit | settings | /settings | edit | تعديل — المستخدمون | Düzenle — Kullanıcılar | PROPOSED |
| users.manage | settings | /settings | manage | إدارة المستخدمين | Eski geniş yönetim — Kullanıcılar | LEGACY |
| users.permissions.view | settings | /settings | permissions.view | عرض — المستخدمون (permissions.view) | Görüntüle — Kullanıcılar (permissions.view) | PROPOSED |
| users.view | settings | /settings | view | عرض — المستخدمون | Görüntüle — Kullanıcılar | PROPOSED |
| warehouse_locations.create | inventory | /inventory/warehouses | create | إنشاء — مواقع التخزين | Oluştur — Depo konumları | PROPOSED |
| warehouse_locations.edit | inventory | /inventory/warehouses | edit | تعديل — مواقع التخزين | Düzenle — Depo konumları | PROPOSED |
| warehouse_locations.toggle_status | inventory | /inventory/warehouses | toggle_status | تفعيل وتعطيل — مواقع التخزين | Etkinleştir veya durdur — Depo konumları | PROPOSED |
| warehouse_locations.view | inventory | /inventory/warehouses | view | عرض — مواقع التخزين | Görüntüle — Depo konumları | PROPOSED |
| warehouses.create | inventory | /inventory/warehouses | create | إنشاء — المستودعات | Oluştur — Depolar | PROPOSED |
| warehouses.edit | inventory | /inventory/warehouses | edit | تعديل — المستودعات | Düzenle — Depolar | PROPOSED |
| warehouses.toggle_status | inventory | /inventory/warehouses | toggle_status | تفعيل وتعطيل — المستودعات | Etkinleştir veya durdur — Depolar | PROPOSED |
| warehouses.view | inventory | /inventory/warehouses | view | عرض — المستودعات | Görüntüle — Depolar | PROPOSED |
| yarn.change_status | inventory | /inventory/yarn | change_status | تغيير الحالة — الخيوط | Durumu değiştir — İplik | PROPOSED |
| yarn.create | inventory | /inventory/yarn | create | إنشاء — الخيوط | Oluştur — İplik | PROPOSED |
| yarn.edit | inventory | /inventory/yarn | edit | تعديل — الخيوط | Düzenle — İplik | PROPOSED |
| yarn.view | inventory | /inventory/yarn | view | عرض — الخيوط | Görüntüle — İplik | PROPOSED |

## All API policies

All paths are templates. HEAD inherits the corresponding GET policy; OPTIONS is protocol-only, never a business bypass. Resource resolvers are declarations, not implemented database checks.

| Method and path | Required permissions / variants | Company | Warehouse | Sensitive field permissions | Independent approval | Kind / resolver | Compound effects |
|---|---|---|---|---|---|---|---|
| DELETE /api/cartela/:id | cartela.delete | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/cartela/color-swatches/:id | cartela_swatches.delete | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/cartela/fiber-types/:id | fiber_types.delete | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/customer-orders/:id | customer_orders.delete | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/customer-orders/templates/:id | order_templates.delete | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/customers/:id | customers.purge | SESSION | NONE | customers.contacts.view, financial.balances.view | customers.purge | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/purchase-invoices/:id | purchases.delete_draft | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/purchase-invoices/:id/purge | purchases.purge_voided | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view | purchases.purge_voided | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/sales-invoices/:id | sales.delete_draft | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/system/active-sessions/:sessionKey | sessions.revoke | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| DELETE /api/telegram/chat-links/:id | telegram.manage | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| GET /api/activation/devices | platform.activation.view | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| GET /api/activation/events | platform.activation.view | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| GET /api/activation/keys | platform.activation.view | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| GET /api/activation/status |  | PUBLIC | NONE |  |  | PUBLIC / resource ownership still requires scope check |  |
| GET /api/ai/settings | ai.settings.view | SESSION | NONE | settings.secrets.manage, inventory.cost.view, financial.profit.view |  | BUSINESS / SERVER_TOOL_DATA_SCOPE_AND_FIELDS |  |
| GET /api/attendance | attendance.view | SESSION | NONE | employees.personal_data.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/attendance/monthly-review | attendance.monthly_review.view | SESSION | NONE | employees.personal_data.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/attendance/shift-types | shift_types.view | SESSION | NONE | employees.personal_data.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/auth/me |  | SELF | NONE |  |  | SELF / resource ownership still requires scope check |  |
| GET /api/auth/presence |  | SELF | NONE |  |  | SELF / resource ownership still requires scope check |  |
| GET /api/cartela | cartela.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/cartela/:cartelaId/colors | cartela_swatches.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/cartela/:cartelaId/colors/catalog-options | cartela_swatches.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/cartela/:id | cartela.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/cartela/fiber-types | fiber_types.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/cartela/lookup | cartela.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/cashbox-transfers | cashbox_transfer.view | SESSION | NONE | financial.balances.view |  | BUSINESS / BOTH_CASHBOXES | AUTOMATIC_GL |
| GET /api/cashbox-transfers/:id | cashbox_transfer.view | SESSION | NONE | financial.balances.view |  | BUSINESS / BOTH_CASHBOXES | AUTOMATIC_GL |
| GET /api/cashboxes | cashboxes.view | SESSION | NONE | financial.balances.view |  | BUSINESS / CASHBOX_COMPANY |  |
| GET /api/cashboxes/:id | cashboxes.view | SESSION | NONE | financial.balances.view |  | BUSINESS / CASHBOX_COMPANY |  |
| GET /api/cashboxes/:id/movements | cashboxes.movements.view | SESSION | NONE | financial.balances.view |  | BUSINESS / CASHBOX_COMPANY |  |
| GET /api/cashboxes/movements/all | cashboxes.movements.view | SESSION | NONE | financial.balances.view |  | BUSINESS / CASHBOX_COMPANY |  |
| GET /api/checks | checks.view | SESSION | NONE | financial.balances.view |  | BUSINESS / CHECK_PARTY_AND_CASHBOX |  |
| GET /api/companies | platform.companies.view | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| GET /api/companies/public |  | PUBLIC | NONE |  |  | PUBLIC / resource ownership still requires scope check |  |
| GET /api/customer-discounts | customer_discount.view | SESSION | NONE | financial.balances.view |  | BUSINESS / resource ownership still requires scope check | AUTOMATIC_GL |
| GET /api/customer-orders | customer_orders.view | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/customer-orders/:id | customer_orders.view | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/customer-orders/import-preview/:orderNo | customer_orders.import_preview | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/customer-orders/templates | order_templates.view | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/customers | customers.view | SESSION | NONE | customers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/customers/:id | customers.view | SESSION | NONE | customers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/customers/:id/purge-preview | customers.purge_preview | SESSION | NONE | customers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/customers/:id/statement | customer_statement.view | SESSION | NONE | customers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/exchange-rates | exchange_rate.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/exchange-rates/:currencyCode | exchange_rate.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/expenses | expenses.view | SESSION | NONE | financial.balances.view |  | BUSINESS / resource ownership still requires scope check | AUTOMATIC_GL |
| GET /api/expenses/categories | expense_categories.view | SESSION | NONE | financial.balances.view |  | BUSINESS / resource ownership still requires scope check | AUTOMATIC_GL |
| GET /api/external-job-matching | external_job_matching.view | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/external-job-matching/:supplierId/:fabricItemId/lines | external_job_matching.view | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/external-jobs | external_job.view | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/external-jobs/:id | external_job.view | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/external-jobs/:id/lifecycle | external_job.view | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / EXTERNAL_JOB_AND_SOURCE_DESTINATION_ROLL_WAREHOUSES_IN_SESSION_COMPANY |  |
| GET /api/external-jobs/:id/receipt | external_job.view | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check | EXTERNAL_PROCESSING_PRICING_RECEIPT_OR_FEE_POSTING |
| GET /api/external-jobs/preparation-types | preparation_types.view | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/categories | fabric_category.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/categories/:id | fabric_category.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/categories/path/:id | fabric_category.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/categories/tree | fabric_category.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/colors | fabric_color.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/colors/:id | fabric_color.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/items | fabric_item.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/items/:id | fabric_item.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/items/:id/colors | fabric_item.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/variants | fabric_variant.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/fabric/variants/:id | fabric_variant.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/finance/chart-of-accounts | chart_of_accounts.view | SESSION | NONE | financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/finance/gl-accounts | chart_of_accounts.view | SESSION | NONE | financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/finance/journal | journal.view | SESSION | NONE | financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/financial-audit/full | financial_audit.view + financial_audit.run | SESSION | NONE | financial.balances.view, inventory.cost.view, financial.profit.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/financial-audit/invoice-consistency | financial_audit.view + financial_audit.run | SESSION | NONE | financial.balances.view, inventory.cost.view, financial.profit.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/health |  | PUBLIC | NONE |  |  | PUBLIC / resource ownership still requires scope check |  |
| GET /api/health/live |  | PUBLIC | NONE |  |  | PUBLIC / resource ownership still requires scope check |  |
| GET /api/intake-dispatch-slips | intake_dispatch.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/intake-dispatch-slips/:id | intake_dispatch.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/intake-operations/:id | intake_operation.view | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory-movements-log | inventory_movements.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory-movements-log/documents | inventory_movements.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/rolls | inventory.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/rolls/:id | inventory.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/rolls/:id/movements | fabric_roll.movements.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/rolls/bulk-pricing/groups | bulk_pricing.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/rolls/bulk-pricing/recent-purchase-invoices | bulk_pricing.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/rolls/next-barcode | fabric_roll.create | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/rolls/sold-material-report | reports.sold_materials.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/stock-import/:batchId/status | stock_import.view_status | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/transfers | inventory_transfer.view | SESSION | SOURCE_AND_DESTINATION | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/transfers/:id | inventory_transfer.view | SESSION | SOURCE_AND_DESTINATION | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/transfers/eligible-rolls | inventory_transfer.create | SESSION | SOURCE_AND_DESTINATION | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/waste | inventory_waste.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/waste/:id | inventory_waste.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/yarn-lots | yarn.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/inventory/yarn-lots/:id | yarn.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/labels/print-jobs | print_jobs.view | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / PRINTED_ROLLS_AND_TEMPLATE_FIELDS |  |
| GET /api/labels/print-jobs/:id | print_jobs.view | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / PRINTED_ROLLS_AND_TEMPLATE_FIELDS |  |
| GET /api/labels/templates | label_template.view | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / PRINTED_ROLLS_AND_TEMPLATE_FIELDS |  |
| GET /api/labels/templates/default | label_template.view | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / PRINTED_ROLLS_AND_TEMPLATE_FIELDS |  |
| GET /api/party-logs | party_activity.view | SESSION | NONE | customers.contacts.view, suppliers.contacts.view |  | BUSINESS / PERSISTED_PARTY_TYPE_AND_PARTY_COMPANY |  |
| GET /api/party-logs/summary | party_activity.view | SESSION | NONE | customers.contacts.view, suppliers.contacts.view |  | BUSINESS / PERSISTED_PARTY_TYPE_AND_PARTY_COMPANY |  |
| GET /api/payroll/advance-installments | advances.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| GET /api/payroll/audit-log | payroll_audit.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| GET /api/payroll/employees | employees.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| GET /api/payroll/employees/:id/wage-history | employee_wages.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| GET /api/payroll/runs | payroll.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| GET /api/payroll/runs/:id | payroll.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| GET /api/payroll/salary-log | payroll_log.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| GET /api/permission-profiles/companies/:companyId/catalog | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.permissions.view) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| GET /api/permission-profiles/companies/:companyId/templates | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.permissions.view) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| GET /api/permission-profiles/companies/:companyId/templates/:id | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.permissions.view) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| GET /api/permission-profiles/companies/:companyId/templates/:id/preview | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.permissions.view) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| GET /api/permission-profiles/companies/:companyId/users/:userId/profile | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.permissions.view) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| GET /api/permission-profiles/me | C1 control: SELF_PROFILE (legacy operation tags: ) | SELF | NONE |  |  | SELF / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| GET /api/purchase-invoices | purchases.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/purchase-invoices/:id | purchases.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/purchase-invoices/:id/edit-eligibility | purchases.edit_confirmed | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view | purchases.edit_confirmed | BUSINESS / resource ownership still requires scope check |  |
| GET /api/purchases/import | purchase_import.view | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/purchases/import/:id | purchase_import.view | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/purchases/import/:id/rows | purchase_import.view | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/reports/cashbox-summary | reports.cashbox_summary.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/customers/activity | reports.customers.activity.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/customers/aging | reports.customers.aging.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/customers/by-status | reports.customers.by_status.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/customers/statement | reports.customers.statement.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/customers/summary | reports.customers.summary.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/dashboard-summary | reports.dashboard_summary.view + financial.profit.view | SESSION | ENTITY_OR_ALLOWED_LIST | financial.profit.view, financial.balances.view, inventory.cost.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/executive/summary-report | reports.executive.summary_report.view + financial.profit.view | SESSION | ENTITY_OR_ALLOWED_LIST | financial.profit.view, financial.balances.view, inventory.cost.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/account-activity | reports.financial.account_activity.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/cash-flow | reports.financial.cash_flow.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/cashbox-movements | reports.financial.cashbox_movements.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/cashboxes | reports.financial.cashboxes.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/currency-differences | reports.financial.currency_differences.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/operational-balance-summary | reports.financial.operational_balance_summary.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/operational-income-expense | reports.financial.operational_income_expense.view + financial.profit.view | SESSION | NONE | financial.profit.view, financial.balances.view, inventory.cost.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/operational-ledger | reports.financial.operational_ledger.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/operational-position | reports.financial.operational_position.view + financial.profit.view | SESSION | NONE | financial.profit.view, financial.balances.view, inventory.cost.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/profit-details | reports.financial.profit_details.view + financial.profit.view | SESSION | NONE | financial.profit.view, financial.balances.view, inventory.cost.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/receipts-payments | reports.financial.receipts_payments.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/financial/vouchers | reports.financial.vouchers.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory-summary | reports.inventory_summary.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/aging | reports.inventory.aging.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/balances | reports.inventory.balances.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/batch-tracking | reports.inventory.batch_tracking.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/by-color | reports.inventory.by_color.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/by-item-color | reports.inventory.by_item_color.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/by-warehouse | reports.inventory.by_warehouse.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/cutting-efficiency | reports.inventory.cutting_efficiency.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/damaged-stock | reports.inventory.damaged_stock.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/fabric-types | reports.inventory.fabric_types.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/movements | reports.inventory.movements.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/negative-stock | reports.inventory.negative_stock.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/remaining-lengths | reports.inventory.remaining_lengths.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/roll-level | reports.inventory.roll_level.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/rolls | reports.inventory.rolls.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/slow-moving | reports.inventory.slow_moving.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/valuation | reports.inventory.valuation.view + inventory.cost.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/inventory/waste-analysis | reports.inventory.waste_analysis.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/parties/activity | reports.parties.activity.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/payroll-summary | reports.payroll_summary.view + payroll.salary.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/payroll/employees | reports.payroll.employees.view + payroll.salary.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/payroll/monthly-summary | reports.payroll.monthly_summary.view + payroll.salary.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/payroll/runs-list | reports.payroll.runs_list.view + payroll.salary.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/payroll/summary | reports.payroll.summary.view + payroll.salary.view | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/printing/jobs | reports.printing.jobs.view | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/printing/printed-labels | reports.printing.printed_labels.view | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/printing/unprinted-rolls | reports.printing.unprinted_rolls.view | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/purchases/by-batch | reports.purchases.by_batch.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/purchases/by-item | reports.purchases.by_item.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/purchases/by-supplier | reports.purchases.by_supplier.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/purchases/cost-trend | reports.purchases.cost_trend.view + inventory.cost.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/purchases/details | reports.purchases.details.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/purchases/import-batches | reports.purchases.import_batches.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/purchases/import-rows | reports.purchases.import_rows.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/purchases/summary | reports.purchases.summary.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/sales/by-agent | reports.sales.by_agent.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/sales/by-color | reports.sales.by_color.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/sales/by-customer | reports.sales.by_customer.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/sales/by-item | reports.sales.by_item.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/sales/by-item-color | reports.sales.by_item_color.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/sales/details | reports.sales.details.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/sales/margins | reports.sales.margins.view + financial.profit.view | SESSION | ENTITY_OR_ALLOWED_LIST | financial.profit.view, financial.balances.view, inventory.cost.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/sales/summary | reports.sales.summary.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/suppliers/activity | reports.suppliers.activity.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/suppliers/aging | reports.suppliers.aging.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/suppliers/by-status | reports.suppliers.by_status.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/suppliers/statement | reports.suppliers.statement.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/suppliers/summary | reports.suppliers.summary.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/reports/vouchers-summary | reports.vouchers_summary.view | SESSION | NONE | financial.balances.view |  | BUSINESS / REPORT_COMPANY_FILTERS_AND_FIELD_PROJECTION | REPORT_FIELD_AND_WAREHOUSE_PROJECTION, PRINT_AND_EXPORT_ARE_SEPARATE_CLIENT_OPERATIONS |
| GET /api/returns | {"source":"SERVER_FILTERED_RETURN_TYPE_LIST","cases":{"SALES_RETURN":["sales_return.view"],"PURCHASE_RETURN":["purchase_return.view"]}} | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE |  |
| GET /api/returns/:id | {"source":"PERSISTED: return_type","cases":{"SALES_RETURN":["sales_return.view"],"PURCHASE_RETURN":["purchase_return.view"]}} | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE |  |
| GET /api/returns/eligible-purchase-invoices | purchase_return.view + purchases.view | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE |  |
| GET /api/returns/eligible-sales-invoices | sales_return.view + sales.view | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE |  |
| GET /api/returns/source-invoice/:invType/:invId | {"source":"PERSISTED: return_type","cases":{"SALES_RETURN":["sales_return.view"],"PURCHASE_RETURN":["purchase_return.view"]}} | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE |  |
| GET /api/sales-invoices | sales.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/sales-invoices/:id | sales.view | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/sales-invoices/:id/edit-eligibility | sales.edit_confirmed | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, inventory.cost.view, financial.balances.view | sales.edit_confirmed | BUSINESS / resource ownership still requires scope check |  |
| GET /api/suppliers | suppliers.view | SESSION | NONE | suppliers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/suppliers/:id | suppliers.view | SESSION | NONE | suppliers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/suppliers/:id/statement | supplier_statement.view | SESSION | NONE | suppliers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/system/active-sessions | sessions.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/system/backup/download |  | PLATFORM | NONE | platform.backup.download |  | RETIRED / resource ownership still requires scope check |  |
| GET /api/system/info |  | PUBLIC | NONE |  |  | PUBLIC / resource ownership still requires scope check |  |
| GET /api/system/permissions | users.permissions.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/system/settings | settings.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/system/telegram/updates | telegram.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/system/users | users.view | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/telegram/chat-links | telegram.view | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| GET /api/telegram/detected-chats | telegram.view | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| GET /api/telegram/settings | telegram.view | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| GET /api/v1/ai/settings | ai.settings.view | SESSION | NONE | settings.secrets.manage, inventory.cost.view, financial.profit.view |  | BUSINESS / SERVER_TOOL_DATA_SCOPE_AND_FIELDS |  |
| GET /api/vouchers | {"source":"SERVER_FILTERED_VOUCHER_TYPE_LIST","cases":{"RECEIPT":["receipt_voucher.view"],"PAYMENT":["payment_voucher.view"]}} | SESSION | NONE | financial.balances.view |  | BUSINESS / PERSISTED_VOUCHER_TYPE_PARTY_CASHBOX | AUTOMATIC_GL_AND_INVOICE_BALANCE |
| GET /api/vouchers/:id | {"source":"PERSISTED: voucher_type","cases":{"RECEIPT":["receipt_voucher.view"],"PAYMENT":["payment_voucher.view"]}} | SESSION | NONE | financial.balances.view |  | BUSINESS / PERSISTED_VOUCHER_TYPE_PARTY_CASHBOX | AUTOMATIC_GL_AND_INVOICE_BALANCE |
| GET /api/warehouses | warehouses.view | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/warehouses/:id | warehouses.view | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / resource ownership still requires scope check |  |
| GET /api/warehouses/:warehouseId/locations | warehouse_locations.view | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/activation/keys/:id/revoke | platform.activation.revoke | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| PATCH /api/cashboxes/:id/toggle-status | cashboxes.toggle_status | SESSION | NONE | financial.balances.view |  | BUSINESS / CASHBOX_COMPANY |  |
| PATCH /api/customer-orders/:id/status | customer_orders.change_status | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/customers/:id/toggle-status | customers.toggle_status | SESSION | NONE | customers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/external-jobs/:id/processing | external_job.edit_processing | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/external-jobs/preparation-types/:id | preparation_types.edit | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/fabric/categories/:id/toggle-status | fabric_category.toggle_status | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/fabric/colors/:id/toggle-status | fabric_color.toggle_status | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/fabric/items/:id/toggle-status | fabric_item.toggle_status | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/fabric/variants/:id/toggle-status | fabric_variant.toggle_status | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/intake-dispatch-slips/:id/lines | intake_dispatch.edit | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/inventory/rolls/:id/missing-fields | fabric_roll.complete_fields | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/inventory/rolls/:id/status | fabric_roll.change_status | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/inventory/rolls/bulk-pricing | bulk_pricing.edit | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/inventory/transfers/:id/cancel | inventory_transfer.cancel | SESSION | SOURCE_AND_DESTINATION | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| PATCH /api/inventory/transfers/:id/confirm | inventory_transfer.confirm | SESSION | SOURCE_AND_DESTINATION | inventory.cost.view | inventory_transfer.confirm | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| PATCH /api/inventory/waste/:id/cancel | inventory_waste.cancel | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| PATCH /api/inventory/waste/:id/confirm | inventory_waste.confirm | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view | inventory_waste.confirm | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| PATCH /api/inventory/yarn-lots/:id/status | yarn.change_status | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/labels/print-jobs/:id/status | print_jobs.update_status | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / PRINTED_ROLLS_AND_TEMPLATE_FIELDS |  |
| PATCH /api/payroll/advance-installments/:id/mark-paid | advances.approve | SESSION | NONE | payroll.salary.view, employees.personal_data.view | advances.approve | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| PATCH /api/payroll/employees/:id/toggle-status | employees.toggle_status | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| PATCH /api/payroll/runs/:id/cancel | payroll.cancel | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| PATCH /api/payroll/runs/:id/confirm | payroll.approve | SESSION | NONE | payroll.salary.view, employees.personal_data.view | payroll.approve | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| PATCH /api/payroll/runs/:id/mark-paid | payroll.disburse | SESSION | NONE | payroll.salary.view, employees.personal_data.view | payroll.disburse | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| PATCH /api/returns/:id/cancel | {"source":"PERSISTED: return_type","cases":{"SALES_RETURN":["sales_return.cancel"],"PURCHASE_RETURN":["purchase_return.cancel"]}} | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| PATCH /api/returns/:id/confirm | {"source":"PERSISTED: return_type","cases":{"SALES_RETURN":["sales_return.confirm"],"PURCHASE_RETURN":["purchase_return.confirm"]}} | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view | sales_return.confirm, purchase_return.confirm | BUSINESS / PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| PATCH /api/suppliers/:id/toggle-status | suppliers.toggle_status | SESSION | NONE | suppliers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/telegram/chat-links/:id/toggle-status | telegram.manage | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| PATCH /api/vouchers/:id/cancel | {"source":"PERSISTED: voucher_type","cases":{"RECEIPT":["receipt_voucher.cancel"],"PAYMENT":["payment_voucher.cancel"]}} | SESSION | NONE | financial.balances.view |  | BUSINESS / PERSISTED_VOUCHER_TYPE_PARTY_CASHBOX | AUTOMATIC_GL_AND_INVOICE_BALANCE |
| PATCH /api/vouchers/:id/confirm | {"source":"PERSISTED: voucher_type","cases":{"RECEIPT":["receipt_voucher.confirm"],"PAYMENT":["payment_voucher.confirm"]}} | SESSION | NONE | financial.balances.view | receipt_voucher.confirm, payment_voucher.confirm | BUSINESS / PERSISTED_VOUCHER_TYPE_PARTY_CASHBOX | AUTOMATIC_GL_AND_INVOICE_BALANCE |
| PATCH /api/warehouse-locations/:id/toggle-status | warehouse_locations.toggle_status | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / resource ownership still requires scope check |  |
| PATCH /api/warehouses/:id/toggle-status | warehouses.toggle_status | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/activation/activate |  | PUBLIC | NONE |  |  | PUBLIC / resource ownership still requires scope check |  |
| POST /api/activation/keys/generate | platform.activation.generate | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| POST /api/ai/fabric-chat | ai.use | SESSION | NONE | settings.secrets.manage, inventory.cost.view, financial.profit.view |  | BUSINESS / SERVER_TOOL_DATA_SCOPE_AND_FIELDS |  |
| POST /api/ai/test-connection | ai.test | SESSION | NONE | settings.secrets.manage, inventory.cost.view, financial.profit.view |  | BUSINESS / SERVER_TOOL_DATA_SCOPE_AND_FIELDS |  |
| POST /api/attendance/import | attendance.import | SESSION | NONE | employees.personal_data.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/attendance/monthly-review/approve | attendance.approve | SESSION | NONE | employees.personal_data.view | attendance.approve | BUSINESS / resource ownership still requires scope check |  |
| POST /api/attendance/shift-types | shift_types.create | SESSION | NONE | employees.personal_data.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/auth/login |  | PUBLIC | NONE |  |  | PUBLIC / resource ownership still requires scope check |  |
| POST /api/auth/logout |  | PUBLIC | NONE |  |  | PUBLIC / resource ownership still requires scope check |  |
| POST /api/auth/switch-company | platform.companies.switch | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| POST /api/cartela | cartela.create | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/cartela/:cartelaId/colors | cartela_swatches.create | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/cartela/fiber-types | fiber_types.create | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/cartela/generate | cartela.generate | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/cartela/quick-draft | cartela.create | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/cashbox-transfers | cashbox_transfer.create | SESSION | NONE | financial.balances.view |  | BUSINESS / BOTH_CASHBOXES | AUTOMATIC_GL |
| POST /api/cashbox-transfers/:id/confirm | cashbox_transfer.confirm | SESSION | NONE | financial.balances.view | cashbox_transfer.confirm | BUSINESS / BOTH_CASHBOXES | AUTOMATIC_GL |
| POST /api/cashbox-transfers/:id/void | cashbox_transfer.void | SESSION | NONE | financial.balances.view |  | BUSINESS / BOTH_CASHBOXES | AUTOMATIC_GL |
| POST /api/cashboxes | cashboxes.create | SESSION | NONE | financial.balances.view |  | BUSINESS / CASHBOX_COMPANY |  |
| POST /api/cashboxes/:id/adjustment | cashboxes.adjust | SESSION | NONE | financial.balances.view | cashboxes.adjust | BUSINESS / CASHBOX_COMPANY |  |
| POST /api/checks | checks.create | SESSION | NONE | financial.balances.view |  | BUSINESS / CHECK_PARTY_AND_CASHBOX |  |
| POST /api/checks/:id/clear | checks.clear | SESSION | NONE | financial.balances.view | checks.clear | BUSINESS / CHECK_PARTY_AND_CASHBOX |  |
| POST /api/checks/:id/deposit | checks.deposit | SESSION | NONE | financial.balances.view | checks.deposit | BUSINESS / CHECK_PARTY_AND_CASHBOX |  |
| POST /api/checks/:id/return | checks.return | SESSION | NONE | financial.balances.view | checks.return | BUSINESS / CHECK_PARTY_AND_CASHBOX |  |
| POST /api/companies | platform.companies.create | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| POST /api/customer-discounts | customer_discount.create + customer_discount.approve | SESSION | NONE | financial.balances.view | customer_discount.approve | BUSINESS / resource ownership still requires scope check | AUTOMATIC_GL, IMMEDIATE_CONFIRMED_DISCOUNT_AND_AUTOMATIC_GL |
| POST /api/customer-discounts/:id/cancel | customer_discount.cancel | SESSION | NONE | financial.balances.view |  | BUSINESS / resource ownership still requires scope check | AUTOMATIC_GL |
| POST /api/customer-orders | customer_orders.create | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/customer-orders/templates | order_templates.create | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/customers | customers.create | SESSION | NONE | customers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/customers/:customerId/legacy-statement-import | customer_statement.financial_import + customer_statement.financial_import.post | SESSION | NONE | financial.balances.view | customer_statement.financial_import.post | BUSINESS / IMPORTED_DOCUMENT_TYPES | CURRENT_CLOTEX_FINANCIAL_IMPORT_NOT_TASK004_ARCHIVE, AUTOMATIC_GL_AND_OPENING_BALANCE |
| POST /api/customers/from-supplier/:supplierId | customers.create_from_supplier + suppliers.view | SESSION | NONE | customers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/customers/import-statement | customer_statement.financial_import + customer_statement.financial_import.post + SALE_LINES_PRESENT: sales.create+sales.confirm + PAYMENTS_PRESENT: receipt_voucher.create+receipt_voucher.confirm + RETURN_PAYMENTS_PRESENT: payment_voucher.create+payment_voucher.confirm | SESSION | NONE | customers.contacts.view, financial.balances.view | customer_statement.financial_import.post, sales.confirm, receipt_voucher.confirm, payment_voucher.confirm | BUSINESS / IMPORTED_CREDITS_ADJUSTMENTS_AND_CUSTOMER_CREATION | FINANCIAL_IMPORT, AUTOMATIC_GL_NOT_MANUAL_JOURNAL_PERMISSION |
| POST /api/documents/render | documents.export | SESSION | NONE | inventory.cost.view, financial.profit.view, financial.balances.view, payroll.salary.view |  | BUSINESS / TRUSTED_DOCUMENT_CONTEXT_NOT_HTML_OR_FILENAME | READ_AND_EXPORT_PERMISSION_OF_TRUSTED_SOURCE_DOCUMENT |
| POST /api/expenses | expenses.create + expenses.confirm | SESSION | NONE | financial.balances.view | expenses.confirm | BUSINESS / resource ownership still requires scope check | AUTOMATIC_GL, IMMEDIATE_CASHBOX_DEBIT_AND_AUTOMATIC_GL |
| POST /api/expenses/:id/cancel | expenses.cancel | SESSION | NONE | financial.balances.view |  | BUSINESS / resource ownership still requires scope check | AUTOMATIC_GL |
| POST /api/external-job-matching/approve-shortage | external_job.approve_shortage | SESSION | ENTITY_LOOKUP | inventory.cost.view | external_job.approve_shortage | BUSINESS / resource ownership still requires scope check |  |
| POST /api/external-jobs | external_job.create | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/external-jobs/:id/confirm | external_job.confirm | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view | external_job.confirm | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/external-jobs/:id/fee | external_job.record_fee | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check | EXTERNAL_PROCESSING_PRICING_RECEIPT_OR_FEE_POSTING |
| POST /api/external-jobs/:id/lifecycle/close | external_job.close | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view | external_job.close | BUSINESS / EXTERNAL_JOB_AND_SOURCE_DESTINATION_ROLL_WAREHOUSES_IN_SESSION_COMPANY | EXTERNAL_JOB_LIFECYCLE_MUTATION |
| POST /api/external-jobs/:id/lifecycle/resolve-defect | external_job.resolve_defect | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view | external_job.resolve_defect | BUSINESS / EXTERNAL_JOB_AND_SOURCE_DESTINATION_ROLL_WAREHOUSES_IN_SESSION_COMPANY | EXTERNAL_JOB_LIFECYCLE_MUTATION, QUALITY_DECISION_CHANGES_ROLL_STATUS |
| POST /api/external-jobs/:id/lifecycle/returns | external_job.receive | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / EXTERNAL_JOB_AND_SOURCE_DESTINATION_ROLL_WAREHOUSES_IN_SESSION_COMPANY | EXTERNAL_JOB_LIFECYCLE_MUTATION, INVENTORY_RECEIPT_AND_QUALITY_RESERVATION |
| POST /api/external-jobs/:id/lifecycle/service-pricing | external_job.price | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / EXTERNAL_JOB_AND_SOURCE_DESTINATION_ROLL_WAREHOUSES_IN_SESSION_COMPANY | EXTERNAL_JOB_LIFECYCLE_MUTATION, SERVICE_PRICING_UPDATES_FEE_HEADER_NOT_GL_POSTING |
| POST /api/external-jobs/:id/lifecycle/services | external_job.edit_processing | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / EXTERNAL_JOB_AND_SOURCE_DESTINATION_ROLL_WAREHOUSES_IN_SESSION_COMPANY | EXTERNAL_JOB_LIFECYCLE_MUTATION |
| POST /api/external-jobs/:id/lifecycle/settlements | external_job.approve_shortage | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view | external_job.approve_shortage | BUSINESS / EXTERNAL_JOB_AND_SOURCE_DESTINATION_ROLL_WAREHOUSES_IN_SESSION_COMPANY | EXTERNAL_JOB_LIFECYCLE_MUTATION, APPROVED_SHORTAGE_OR_EXCESS_AND_SOURCE_BALANCE |
| POST /api/external-jobs/:id/lines/:lineId/receive | external_job.receive | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/external-jobs/:id/post-fee | external_job.post_fee | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view | external_job.post_fee | BUSINESS / resource ownership still requires scope check | EXTERNAL_PROCESSING_PRICING_RECEIPT_OR_FEE_POSTING |
| POST /api/external-jobs/:id/pricing | external_job.price | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check | EXTERNAL_PROCESSING_PRICING_RECEIPT_OR_FEE_POSTING |
| POST /api/external-jobs/:id/receipt | external_job.receive | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check | EXTERNAL_PROCESSING_PRICING_RECEIPT_OR_FEE_POSTING |
| POST /api/external-jobs/:id/receipt/approve-shortage | external_job.approve_shortage | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view | external_job.approve_shortage | BUSINESS / resource ownership still requires scope check |  |
| POST /api/external-jobs/:id/void | external_job.void | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/external-jobs/:id/void-processing | external_job.void_processing | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/external-jobs/preparation-types | preparation_types.create | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/external-jobs/processing | external_job.process + external_job.confirm | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view | external_job.confirm | BUSINESS / resource ownership still requires scope check | EXTERNAL_PROCESSING_PRICING_RECEIPT_OR_FEE_POSTING, PROCESSING_IS_CREATED_CONFIRMED_AND_SENDS_ROLLS |
| POST /api/fabric/categories | fabric_category.create | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/fabric/categories/sync-from-materials | fabric_category.sync | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/fabric/colors | fabric_color.create | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/fabric/items | fabric_item.create | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/fabric/variants | fabric_variant.create | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/finance/journal-entries | journal.create + journal.post | SESSION | NONE | financial.balances.view | journal.post | BUSINESS / resource ownership still requires scope check |  |
| POST /api/intake-dispatch-slips/:id/create-purchase-invoice | intake_dispatch.create_purchase_invoice + purchases.create + purchases.confirm | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view | purchases.confirm | BUSINESS / resource ownership still requires scope check | DERIVED_PURCHASE_DOCUMENT_IS_CONFIRMED_WITH_SKIP_STOCK_MOVEMENT |
| POST /api/intake-dispatch-slips/:id/void | intake_dispatch.void | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/intake-operations | intake_operation.create | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/intake-operations/:id/finalize | intake_operation.finalize | SESSION | ENTITY_LOOKUP |  | intake_operation.finalize | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/inventory/fabric-classification/resolve | fabric_classification.resolve | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/inventory/rolls | fabric_roll.create | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/inventory/rolls/:id/move | fabric_roll.move | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/inventory/rolls/bulk-pricing/finalize-purchase | bulk_pricing.finalize_purchase + purchases.create + purchases.confirm | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view | purchases.confirm | BUSINESS / resource ownership still requires scope check | DERIVED_PURCHASE_DOCUMENT_IS_CONFIRMED_WITH_SKIP_STOCK_MOVEMENT |
| POST /api/inventory/stock-import | stock_import.create | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/inventory/transfers | inventory_transfer.create | SESSION | SOURCE_AND_DESTINATION | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/inventory/waste | inventory_waste.create | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/inventory/yarn-lots | yarn.create | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/labels/print-jobs | labels.print | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / PRINTED_ROLLS_AND_TEMPLATE_FIELDS |  |
| POST /api/labels/rolls/preview | labels.preview | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / PRINTED_ROLLS_AND_TEMPLATE_FIELDS |  |
| POST /api/labels/rolls/preview-by-batch | labels.preview | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / PRINTED_ROLLS_AND_TEMPLATE_FIELDS |  |
| POST /api/party-logs | party_activity.create | SESSION | NONE | customers.contacts.view, suppliers.contacts.view |  | BUSINESS / PERSISTED_PARTY_TYPE_AND_PARTY_COMPANY |  |
| POST /api/payroll/employees | employees.create | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| POST /api/payroll/employees/:id/advance | advances.create | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| POST /api/payroll/employees/:id/pay-salary | payroll.disburse | SESSION | NONE | payroll.salary.view, employees.personal_data.view | payroll.disburse | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| POST /api/payroll/runs | payroll.create | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| POST /api/payroll/runs/import-excel | payroll.import | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| POST /api/permission-profiles/companies/:companyId/templates | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.edit) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| POST /api/permission-profiles/companies/:companyId/templates/:id/archive | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.edit) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| POST /api/permission-profiles/companies/:companyId/templates/:id/copy | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.edit) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| POST /api/permission-profiles/companies/:companyId/templates/:id/publish | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.edit) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| POST /api/permission-profiles/me/check | C1 control: SELF_PROFILE (legacy operation tags: ) | SELF | NONE |  |  | SELF / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| POST /api/purchase-invoices | purchases.create + CONFIRM_TRUE: purchases.confirm + CONFIRM_AND_PAID: payment_voucher.create+payment_voucher.confirm | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view | purchases.confirm, payment_voucher.confirm | BUSINESS / resource ownership still requires scope check | OPTIONAL_IMMEDIATE_CONFIRM, OPTIONAL_AUTOMATIC_PAYMENT, AUTOMATIC_GL_NOT_MANUAL_JOURNAL_PERMISSION |
| POST /api/purchase-invoices/:id/confirm | purchases.confirm | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view | purchases.confirm | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/purchase-invoices/:id/void | purchases.void | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/purchase-invoices/repair-stale-rolls | purchases.repair_rolls | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/purchases/import/:id/cancel | purchase_import.cancel | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/purchases/import/:id/confirm | purchase_import.confirm | SESSION | ENTITY_LOOKUP | inventory.cost.view | purchase_import.confirm | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/purchases/import/:id/scan-verify | purchase_import.scan_verify | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/purchases/import/preview | purchase_import.preview | SESSION | ENTITY_LOOKUP | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/returns | {"source":"BODY: returnType","cases":{"SALES_RETURN":["sales_return.create"],"PURCHASE_RETURN":["purchase_return.create"]}} | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE |  |
| POST /api/sales-invoices | sales.create + CONFIRM_TRUE: sales.confirm + CONFIRM_AND_PAID: receipt_voucher.create+receipt_voucher.confirm | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, inventory.cost.view, financial.balances.view | sales.confirm, receipt_voucher.confirm | BUSINESS / resource ownership still requires scope check | OPTIONAL_IMMEDIATE_CONFIRM, OPTIONAL_AUTOMATIC_PAYMENT, AUTOMATIC_GL_NOT_MANUAL_JOURNAL_PERMISSION |
| POST /api/sales-invoices/:id/confirm | sales.confirm | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, inventory.cost.view, financial.balances.view | sales.confirm | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/sales-invoices/:id/void | sales.void | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| POST /api/suppliers | suppliers.create | SESSION | NONE | suppliers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/system/backup/download | platform.backup.download | PLATFORM | NONE | platform.backup.download |  | PLATFORM / resource ownership still requires scope check | LIVE_PLATFORM_FLAG, CURRENT_PASSWORD_REAUTH_BEFORE_AND_AFTER_DUMP, DURABLE_PLATFORM_AUDIT |
| POST /api/system/purge-business-data | business_data.purge | SESSION | NONE |  | business_data.purge | BUSINESS / resource ownership still requires scope check |  |
| POST /api/system/telegram/test | telegram.test | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/system/users | users.create | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/telegram/chat-links | telegram.manage | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| POST /api/telegram/chat-links/:id/test-message | telegram.test | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| POST /api/telegram/fetch-updates | telegram.manage | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| POST /api/telegram/invoice | telegram.send + invoice_statement.view | SESSION | NONE | settings.secrets.manage |  | BUSINESS / TRUSTED_DOCUMENT_AND_TARGET_COMPANY_NOT_HTML_CHATID_OR_FILENAME | READ_EXPORT_SEND_TRUSTED_DOCUMENT_AND_RECIPIENT |
| POST /api/telegram/statement | telegram.send + documents.send + {"source":"TRUSTED: statement party type","cases":{"CUSTOMER":["customer_statement.view","customer_statement.export","customer_statement.send"],"SUPPLIER":["supplier_statement.view","supplier_statement.export","supplier_statement.send"]}} | SESSION | NONE | settings.secrets.manage |  | BUSINESS / TRUSTED_DOCUMENT_AND_TARGET_COMPANY_NOT_HTML_CHATID_OR_FILENAME | READ_EXPORT_SEND_TRUSTED_DOCUMENT_AND_RECIPIENT |
| POST /api/telegram/test-bot | telegram.test | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| POST /api/telegram/voucher | telegram.send + documents.send | SESSION | NONE | settings.secrets.manage |  | BUSINESS / TRUSTED_DOCUMENT_AND_TARGET_COMPANY_NOT_HTML_CHATID_OR_FILENAME | READ_EXPORT_SEND_TRUSTED_DOCUMENT_AND_RECIPIENT |
| POST /api/v1/ai/fabric-chat | ai.use | SESSION | NONE | settings.secrets.manage, inventory.cost.view, financial.profit.view |  | BUSINESS / SERVER_TOOL_DATA_SCOPE_AND_FIELDS |  |
| POST /api/v1/ai/test-connection | ai.test | SESSION | NONE | settings.secrets.manage, inventory.cost.view, financial.profit.view |  | BUSINESS / SERVER_TOOL_DATA_SCOPE_AND_FIELDS |  |
| POST /api/vouchers | {"source":"BODY: voucherType","cases":{"RECEIPT":["receipt_voucher.create"],"PAYMENT":["payment_voucher.create"]}} | SESSION | NONE | financial.balances.view |  | BUSINESS / PERSISTED_VOUCHER_TYPE_PARTY_CASHBOX | AUTOMATIC_GL_AND_INVOICE_BALANCE |
| POST /api/warehouses | warehouses.create | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / resource ownership still requires scope check |  |
| POST /api/warehouses/:warehouseId/locations | warehouse_locations.create | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/ai/settings | ai.settings.manage | SESSION | NONE | settings.secrets.manage, inventory.cost.view, financial.profit.view |  | BUSINESS / SERVER_TOOL_DATA_SCOPE_AND_FIELDS |  |
| PUT /api/attendance/:id | attendance.edit | SESSION | NONE | employees.personal_data.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/cartela/:id | cartela.edit | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/cartela/color-swatches/:id | cartela_swatches.edit | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/cashboxes/:id | cashboxes.edit | SESSION | NONE | financial.balances.view |  | BUSINESS / CASHBOX_COMPANY |  |
| PUT /api/companies/:id | platform.companies.edit | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| PUT /api/customer-orders/:id | customer_orders.edit | SESSION | NONE | inventory.sale_price.view, customers.contacts.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/customers/:id | customers.edit | SESSION | NONE | customers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/exchange-rates/:currencyCode | exchange_rate.manage | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/fabric/categories/:id | fabric_category.edit | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/fabric/colors/:id | fabric_color.edit | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/fabric/items/:id | fabric_item.edit | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/fabric/variants/:id | fabric_variant.edit | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/inventory/rolls/:id | fabric_roll.edit | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/inventory/transfers/:id | inventory_transfer.edit | SESSION | SOURCE_AND_DESTINATION | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/inventory/waste/:id | inventory_waste.edit | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/inventory/yarn-lots/:id | yarn.edit | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, inventory.sale_price.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/payroll/employees/:id | employees.edit | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| PUT /api/payroll/runs/:id | payroll.edit | SESSION | NONE | payroll.salary.view, employees.personal_data.view |  | BUSINESS / EMPLOYEE_OR_PAYROLL_RUN_COMPANY |  |
| PUT /api/permission-profiles/companies/:companyId/default-template | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.edit) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| PUT /api/permission-profiles/companies/:companyId/templates/:id/draft | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.edit) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| PUT /api/permission-profiles/companies/:companyId/users/:userId/delegation | C1 control: LIVE_PLATFORM_REAUTH (legacy operation tags: platform.roles.manage) | PLATFORM | NONE |  |  | PLATFORM / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED, CURRENT_PASSWORD_REAUTH, LAST_DELEGATOR_PROTECTION |
| PUT /api/permission-profiles/companies/:companyId/users/:userId/profile | C1 control: INDEPENDENT_PERMISSION_ADMIN (legacy operation tags: users.edit) | SESSION | NONE |  |  | BUSINESS / LIVE_C1_INDEPENDENT_DELEGATION_AND_GRANTABLE_CEILING_NOT_USERS_MANAGE | C1_MANAGER_OR_LIVE_PLATFORM_REQUIRED, LIVE_COMPANY_SCOPE, C1_MUTATIONS_TRANSACTIONAL_AND_AUDITED |
| PUT /api/purchase-invoices/:id | purchases.edit_draft | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/purchase-invoices/:id/confirmed | purchases.edit_confirmed | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.cost.view, financial.balances.view | purchases.edit_confirmed | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| PUT /api/returns/:id | {"source":"PERSISTED: return_type","cases":{"SALES_RETURN":["sales_return.edit"],"PURCHASE_RETURN":["purchase_return.edit"]}} | SESSION | ENTITY_LOOKUP | inventory.cost.view, financial.balances.view |  | BUSINESS / PERSISTED_RETURN_TYPE_AND_SOURCE_INVOICE |  |
| PUT /api/sales-invoices/:id | sales.edit_draft | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, inventory.cost.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/sales-invoices/:id/confirmed | sales.edit_confirmed | SESSION | ENTITY_OR_ALLOWED_LIST | inventory.sale_price.view, inventory.cost.view, financial.balances.view | sales.edit_confirmed | BUSINESS / resource ownership still requires scope check | INVENTORY_OR_GL_SIDE_EFFECTS_OF_AUTHORIZED_BUSINESS_OPERATION |
| PUT /api/suppliers/:id | suppliers.edit | SESSION | NONE | suppliers.contacts.view, financial.balances.view |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/system/roles/:code | platform.roles.manage | PLATFORM | NONE |  |  | PLATFORM / resource ownership still requires scope check |  |
| PUT /api/system/settings/:key | settings.manage | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/system/users/:id | users.edit | SESSION | NONE |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/telegram/chat-links/:id | telegram.manage | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| PUT /api/telegram/settings | telegram.manage | SESSION | NONE | settings.secrets.manage |  | BUSINESS / CHAT_LINK_AND_TARGET_COMPANY |  |
| PUT /api/v1/ai/settings | ai.settings.manage | SESSION | NONE | settings.secrets.manage, inventory.cost.view, financial.profit.view |  | BUSINESS / SERVER_TOOL_DATA_SCOPE_AND_FIELDS |  |
| PUT /api/vouchers/:id | {"source":"PERSISTED: voucher_type","cases":{"RECEIPT":["receipt_voucher.edit"],"PAYMENT":["payment_voucher.edit"]}} | SESSION | NONE | financial.balances.view |  | BUSINESS / PERSISTED_VOUCHER_TYPE_PARTY_CASHBOX | AUTOMATIC_GL_AND_INVOICE_BALANCE |
| PUT /api/warehouse-locations/:id | warehouse_locations.edit | SESSION | ENTITY_LOOKUP |  |  | BUSINESS / resource ownership still requires scope check |  |
| PUT /api/warehouses/:id | warehouses.edit | SESSION | ENTITY_OR_ALLOWED_LIST |  |  | BUSINESS / resource ownership still requires scope check |  |

## Frontend pages

| Path | Component | Entry permissions | Demo |
|---|---|---|---|
| /login | Login |  | no |
| / | RequireAuth | dashboard.view | no |
| [index] | Dashboard | dashboard.view | no |
| inventory | Inventory | inventory.view | no |
| inventory/create | CreateItem | fabric_item.create | no |
| inventory/edit/:id | CreateItem | fabric_item.edit | no |
| inventory/intake-dispatch-slips | IntakeDispatchSlips | intake_dispatch.view | no |
| inventory/movements-log | InventoryMovementsLog | inventory_movements.view | no |
| inventory/yarn | YarnManagement | yarn.view | no |
| inventory/settings | InventorySettings | inventory.settings.view | no |
| inventory/labels | StickerPrinting | labels.print | no |
| inventory/custom-label | CustomStickerPrinting | labels.custom.view | no |
| cartela | CartelaLabels | cartela.view | no |
| inventory/cartela | Navigate | cartela.view | no |
| inventory/bulk-pricing | BulkPricing | bulk_pricing.view | no |
| inventory/warehouses | Warehouses | warehouses.view | no |
| inventory/transfers | Transfers | inventory_transfer.view | no |
| inventory/depreciation | Depreciation | inventory_waste.view | no |
| inventory/categories | Categories | fabric_category.view | no |
| inventory/fabric-master-data | FabricMasterData | fabric_item.view | no |
| inventory/rolls/new | CreateRoll | fabric_roll.create | no |
| inventory/rolls/:id | RollDetails | inventory.view | no |
| inventory/rolls/:id/edit | RollDetails | fabric_roll.edit | no |
| inventory/rolls/:id/move | RollDetails | fabric_roll.move | no |
| purchases/import-excel | ImportExcel | purchase_import.preview | no |
| purchases/import-batches | ImportBatches | purchase_import.view | no |
| purchases/external-jobs | ExternalJobs | external_job.view | no |
| purchases/external-jobs/processing/new | ExternalJobProcessingNew | external_job.process | no |
| purchases/intake-operations/new | IntakeOperationNew | intake_operation.create | no |
| purchases/external-job-matching | ExternalJobMatching | external_job_matching.view | no |
| purchases/external-jobs/:id | ExternalJobReceipt | external_job.view | no |
| inventory/print-jobs | PrintJobs | print_jobs.view | no |
| invoices/sales | Sales | sales.view | no |
| invoices/sales/new | InvoiceForm | sales.create | no |
| invoices/sales/:id/edit | InvoiceForm | sales.edit_draft | no |
| invoices/purchases | Purchases | purchases.view | no |
| invoices/purchases/new | InvoiceForm | purchases.create | no |
| invoices/purchases/:id/edit | InvoiceForm | purchases.edit_draft | no |
| invoices/exchange | ExchangeInvoices | exchange_invoices.view | YES: view only |
| invoices/returns | ReturnInvoices | sales_return.view | no |
| invoices/statement | InvoiceStatement | invoice_statement.view | no |
| invoices/statement/:id | InvoiceStatement | invoice_statement.view | no |
| orders | CustomerOrdersPage | customer_orders.view | no |
| treasury | Safes | cashboxes.view | no |
| treasury/safes | Safes | cashboxes.view | no |
| treasury/checks-vault | ChecksVault | checks.view | no |
| treasury/log | TreasuryLog | cashboxes.movements.view | no |
| treasury/profit-details | ProfitDetails | financial.profit.view | no |
| treasury/settings | TreasurySettings | cashboxes.view | no |
| bonds/payment | PaymentBonds | payment_voucher.view | no |
| bonds/collection | CollectionBonds | receipt_voucher.view | no |
| bonds/records | BondRecords | receipt_voucher.view | no |
| bonds/records/:id | BondDetails | receipt_voucher.view | no |
| salaries | Salaries | payroll.view | no |
| hr/employees | Employees | employees.view | no |
| hr/attendance | Attendance | attendance.view | no |
| hr/monthly-review | MonthlyAttendanceReview | attendance.monthly_review.view | no |
| salaries/log | PayrollSalaryLog | payroll_log.view | no |
| reports | ReportsCenter | reports.view | no |
| customers | Customers | customers.view | no |
| customers/log | CustomersLog | party_activity.view | no |
| customers/statement | CustomerStatement | customer_statement.view | no |
| suppliers | Suppliers | suppliers.view | no |
| suppliers/log | SuppliersLog | party_activity.view | no |
| suppliers/statement | SupplierStatement | supplier_statement.view | no |
| expenses | Expenses | expenses.view | no |
| chart-of-accounts | Accounting | chart_of_accounts.view | no |
| journal | Journal | journal.view | no |
| manufacturing | Manufacturing | manufacturing.view | YES: view only |
| partners | Partners | partners.view | YES: view only |
| settings | SystemSettings | settings.view | no |
| settings/desktop | DesktopSettings | desktop.settings.view | no |
