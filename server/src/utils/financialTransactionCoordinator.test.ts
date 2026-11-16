/**
 * TASK 006 — المرحلة الأولى: اختبارات منسق المعاملات المالية.
 *
 * لا يوجد نفق متاح لقاعدة بيانات PostgreSQL معزولة وقت كتابة هذا الاختبار
 * (نفس القيد المذكور بـexternalJobProcessing.test.ts) — فالاختبارات هنا
 * تستخدم عميل Postgres مزيّف (fake client) يحاكي فعلياً دلالة BEGIN/COMMIT/
 * ROLLBACK/release عبر عدّادات واضحة، بنفس نمط الـfake-db المعتمد بالمشروع.
 * هذا يكفي لإثبات الخاصية الأهم: لا تُترَك معاملة مفتوحة ولا اتصال بلا
 * تحرير (release) في أي مسار — نجاح أو فشل — وهي تحديداً الثغرة المكتشفة
 * فعلياً بـvoucherRoutes.ts (PUT /:id) التي عالجتها هذه المرحلة.
 */
import assert from 'node:assert/strict';
import type { Pool, PoolClient } from 'pg';
import {
  withFinancialTransaction,
  classifySalesInvoiceForCancellation,
} from './financialTransactionCoordinator.js';

function createFakeClient() {
  const queries: string[] = [];
  let releaseCount = 0;
  const client = {
    query: async (sql: string) => {
      queries.push(sql.trim());
      return { rows: [] };
    },
    release: () => {
      releaseCount += 1;
    },
  } as unknown as PoolClient;
  return { client, queries, getReleaseCount: () => releaseCount };
}

function createFakePool(client: PoolClient) {
  return {
    connect: async () => client,
  } as unknown as Pool;
}

async function testCommitsOnSuccessAndReleasesExactlyOnce() {
  const { client, queries, getReleaseCount } = createFakeClient();
  const pool = createFakePool(client);

  const result = await withFinancialTransaction(pool, async () => {
    return 42;
  });

  assert.equal(result, 42);
  assert.deepEqual(queries, ['BEGIN', 'COMMIT']);
  assert.equal(getReleaseCount(), 1);
}

async function testRollsBackOnThrowAndReleasesExactlyOnce() {
  const { client, queries, getReleaseCount } = createFakeClient();
  const pool = createFakePool(client);

  await assert.rejects(
    withFinancialTransaction(pool, async () => {
      throw new Error('فشل متعمَّد داخل المعاملة');
    }),
    /فشل متعمَّد/,
  );

  assert.deepEqual(queries, ['BEGIN', 'ROLLBACK']);
  assert.equal(getReleaseCount(), 1, 'الاتصال يجب أن يُحرَّر مرة واحدة فقط حتى عند الفشل');
}

async function testEarlyThrowInsideFnStillRollsBack() {
  // يحاكي تحديداً نمط الخطأ المكتشف فعلياً: دالة تُلقي استثناءً بدل إعادة
  // قيمة مباشرة من منتصف المنطق — يجب أن يبقى ROLLBACK مضموناً دائماً.
  const { client, queries, getReleaseCount } = createFakeClient();
  const pool = createFakePool(client);

  async function simulateVoucherNotFoundPath(): Promise<never> {
    throw Object.assign(new Error('السند غير موجود'), { code: 'NOT_FOUND' });
  }

  await assert.rejects(withFinancialTransaction(pool, simulateVoucherNotFoundPath));

  assert.deepEqual(queries, ['BEGIN', 'ROLLBACK']);
  assert.equal(getReleaseCount(), 1);
}

function testClassifyLegacyWhenReconciled() {
  const result = classifySalesInvoiceForCancellation({
    paidAmount: 50,
    remainingAmount: 50,
    totalAmount: 100,
    linkedConfirmedVoucherAmountSum: 50,
  });
  assert.equal(result, 'LEGACY');
}

function testClassifyReviewRequiredWhenInternalSumMismatched() {
  const result = classifySalesInvoiceForCancellation({
    paidAmount: 50,
    remainingAmount: 40, // 50+40 != 100 — بيانات غير متّسقة داخلياً
    totalAmount: 100,
    linkedConfirmedVoucherAmountSum: 50,
  });
  assert.equal(result, 'REVIEW_REQUIRED');
}

function testClassifyReviewRequiredWhenVoucherSumMismatched() {
  const result = classifySalesInvoiceForCancellation({
    paidAmount: 50,
    remainingAmount: 50,
    totalAmount: 100,
    linkedConfirmedVoucherAmountSum: 30, // سندات القبض المرتبطة لا تفسّر المبلغ المسجَّل كمدفوع
  });
  assert.equal(result, 'REVIEW_REQUIRED');
}

function testClassifyToleratesPennyRounding() {
  const result = classifySalesInvoiceForCancellation({
    paidAmount: 50.005,
    remainingAmount: 49.995,
    totalAmount: 100,
    linkedConfirmedVoucherAmountSum: 50,
  });
  assert.equal(result, 'LEGACY');
}

async function main() {
  await testCommitsOnSuccessAndReleasesExactlyOnce();
  await testRollsBackOnThrowAndReleasesExactlyOnce();
  await testEarlyThrowInsideFnStillRollsBack();
  testClassifyLegacyWhenReconciled();
  testClassifyReviewRequiredWhenInternalSumMismatched();
  testClassifyReviewRequiredWhenVoucherSumMismatched();
  testClassifyToleratesPennyRounding();
  console.log('financialTransactionCoordinator.test.ts OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
