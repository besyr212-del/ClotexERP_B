import type { PoolClient } from 'pg';

type Db = Pick<PoolClient, 'query'>;

/**
 * Standalone leaf module — no imports from salesInvoiceService/purchaseInvoiceService/
 * externalManufacturingLifecycle. Those three otherwise form an import cycle
 * (externalManufacturingLifecycle -> purchaseInvoiceService -> salesInvoiceService
 * -> externalManufacturingLifecycle) that crashes at module load with
 * "Cannot access 'invoiceLineSchema' before initialization" the moment
 * salesInvoiceService needs this guard.
 */
export async function assertNoQualityHold(db: Db, companyId: string, rollId: string) {
  if (
    (
      await db.query(
        `SELECT 1 FROM external_job_return_lines WHERE company_id=$1 AND result_roll_id=$2 AND defective AND resolution IS NULL`,
        [companyId, rollId],
      )
    ).rows.length
  ) {
    throw Object.assign(new Error('البضاعة محجوزة للفحص؛ البيع والصرف والنقل ممنوع'), { code: 'INVALID_STOCK' });
  }
}
