/**
 * TASK 006 — المرحلة الأولى: منسق معاملات مالية موحد.
 *
 * هذا الملف لا يغيّر أي سلوك مالي حالي ولا يُستخدَم بعد من أي مسار موجود —
 * هو أساس بنيوي فقط لمراحل TASK 006 القادمة (إلغاء الفواتير ورد الأموال).
 * المسارات الحالية (salesInvoiceRoutes.ts، voucherRoutes.ts، ...) تستمر
 * بفتح/إغلاق معاملاتها بنفس الطريقة الحالية دون أي تعديل.
 */

import type { Pool, PoolClient } from 'pg';

/**
 * يفتح معاملة PostgreSQL، يُنفّذ `fn` بداخلها، ويضمن COMMIT عند النجاح أو
 * ROLLBACK عند أي استثناء — مع تحرير الاتصال (`release`) في كل الحالات
 * بالضبط مرة واحدة. يمنع فئة الأخطاء المكتشفة فعلياً بالمشروع (مسار خروج
 * مبكّر بـ`return` بعد `BEGIN` دون `ROLLBACK`، يُترك الاتصال بالمجمّع
 * ومعاملته مفتوحة وقفله ساري) — أي كود مستقبلي يستخدم هذا المنسّق بدل
 * `pool.connect()`/`BEGIN`/`COMMIT` اليدوي محميّ من هذا الخطأ بالبنية.
 */
export async function withFinancialTransaction<T>(
  pool: Pool,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // الاتصال قد يكون مكسوراً فعلاً (مثال: فقد الشبكة) — تجاهل فشل
      // الـROLLBACK نفسه، الخطأ الأصلي هو ما يجب أن يصل للمستدعي.
    }
    throw error;
  } finally {
    client.release();
  }
}

/**
 * ترتيب الأقفال الموحّد المُعتمَد لأي عملية مالية تلمس أكثر من جدول — مطابق
 * تماماً لما أثبته فحص الكود الفعلي لمسارات التأكيد/الإلغاء الحالية
 * (confirmSalesInvoice/voidSalesInvoice في salesInvoiceService.ts،
 * applyVoucherConfirmation/cancelConfirmedVoucher في voucherCashboxService.ts):
 * رأس المستند أولاً (قفل وحيد يحدد الحالة)، ثم الأتواب/المخزون الفعلي سطراً
 * بسطر، ثم حسابات الخزينة، وأخيراً الترحيل المحاسبي (الذي يحمي نفسه من
 * الازدواج عبر فحص journal_entries بـsource_type/source_id قبل أي إدراج).
 *
 * هذا الترتيب **توثيقي فقط بهذه المرحلة** — لا يُفرَض برمجياً على الكود
 * الحالي (الذي يعمل بشكل صحيح اليوم ويجب ألا يتغيّر سلوكه)، لكنه المرجع
 * الذي يجب أن تلتزم به أي مرحلة قادمة من TASK 006 عند بناء منطق جديد
 * يلمس أكثر من نوع مستند في معاملة واحدة.
 */
export const FINANCIAL_LOCK_ORDER = [
  'DOCUMENT_HEADER', // sales_invoices / purchase_invoices / vouchers (FOR UPDATE على الرأس أولاً)
  'INVENTORY_ROWS', // fabric_rolls (سطر بسطر، بعد قفل الرأس)
  'CASHBOX_ROWS', // cashboxes (FOR UPDATE لكل خزينة مستخدَمة)
  'GENERAL_LEDGER', // journal_entries — آخر خطوة، محمية بفحص source_type/source_id
] as const;

export type FinancialLockStage = (typeof FINANCIAL_LOCK_ORDER)[number];

/**
 * تصنيف مستند مالي قبل أي عملية إلغاء/رد مستقبلية — ثلاث حالات فقط:
 *
 * - LEGACY: مستند موجود اليوم تحت النظام الحالي (ربط سند بفاتورة عبر تطابق
 *   نصي لـreference_document_no، بلا جدول تخصيص مبالغ حقيقي — مؤكَّد غياب
 *   هذا الجدول بالفحص الفعلي). **كل مستندات اليوم تُصنَّف LEGACY** لأن محرك
 *   التخصيص الجديد (المراحل القادمة من TASK 006) لم يُبنَ بعد.
 * - MANAGED: محجوزة لمستندات تُنشأ بعد تفعيل محرك التخصيص الجديد (مراحل
 *   قادمة) — لا يُصنَّف أي مستند بهذه الحالة بعد بهذه المرحلة.
 * - REVIEW_REQUIRED: مستند بياناته غير متّسقة بما يكفي لإلغائه تلقائياً
 *   بأمان بأي مرحلة قادمة — يحتاج مراجعة يدوية قبل أي عملية إلغاء/رد.
 */
export type FinancialDocumentClassification = 'LEGACY' | 'MANAGED' | 'REVIEW_REQUIRED';

export interface SalesInvoiceClassificationInput {
  /** sales_invoices.paid_amount */
  paidAmount: number;
  /** sales_invoices.remaining_amount */
  remainingAmount: number;
  /** sales_invoices.total_amount */
  totalAmount: number;
  /** مجموع amount لكل سندات القبض المرتبطة بهذه الفاتورة عبر reference_document_no (حالة CONFIRMED فقط) */
  linkedConfirmedVoucherAmountSum: number;
}

const RECONCILIATION_EPS = 0.01;

/**
 * يطبّق قاعدة REVIEW_REQUIRED الوحيدة المحدَّدة بهذه المرحلة: إن لم يتطابق
 * paid_amount مع مجموع سندات القبض المرتبطة فعلياً (بحدود تقريب هللة واحدة)،
 * أو كانت الحقول نفسها غير متّسقة رياضياً (paid+remaining != total)،
 * فالمستند غير آمن للتصنيف كـLEGACY القابل للإلغاء الآلي مستقبلاً — يُعلَّم
 * REVIEW_REQUIRED ليحتاج تدخلاً يدوياً بدل محاولة الإلغاء الآلي على بيانات
 * غير متّسقة. أي حالة غير ذلك تبقى LEGACY (الوضع الافتراضي لكل شيء اليوم).
 */
export function classifySalesInvoiceForCancellation(
  input: SalesInvoiceClassificationInput,
): FinancialDocumentClassification {
  const { paidAmount, remainingAmount, totalAmount, linkedConfirmedVoucherAmountSum } = input;

  const internalSumMismatch = Math.abs(paidAmount + remainingAmount - totalAmount) > RECONCILIATION_EPS;
  const voucherSumMismatch = Math.abs(paidAmount - linkedConfirmedVoucherAmountSum) > RECONCILIATION_EPS;

  if (internalSumMismatch || voucherSumMismatch) {
    return 'REVIEW_REQUIRED';
  }

  return 'LEGACY';
}
