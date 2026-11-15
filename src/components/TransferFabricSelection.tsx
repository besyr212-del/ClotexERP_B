import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FabricRollDto } from '../lib/api/fabricRollsApi';
import { listEligibleTransferRolls } from '../lib/api/inventoryTransfersApi';
import { groupTransferRolls, loadAllTransferRolls, mergeTransferSelection, transferColorRolls, transferTotals } from '../lib/inventory/transferSelection';

export function TransferFabricSelection({ warehouseId, locationId, selected, onChange, disabled, revision }: {
  warehouseId: string; locationId: string; selected: FabricRollDto[];
  onChange: (rows: FabricRollDto[]) => void; disabled: boolean; revision: number;
}) {
  const { t, i18n } = useTranslation('transfers');
  const [mode, setMode] = useState('single');
  const [itemId, setItemId] = useState('');
  const [rows, setRows] = useState<FabricRollDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadedScope, setLoadedScope] = useState('');
  const scope = `${warehouseId}:${locationId}:${revision}`;
  useEffect(() => {
    let cancelled = false;
    setRows([]); setItemId(''); setError(''); setLoading(Boolean(warehouseId));
    if (!warehouseId) return;
    loadAllTransferRolls((page) => listEligibleTransferRolls({ warehouseId, locationId: locationId || undefined, page, pageSize: 500 }),
      warehouseId, locationId, () => cancelled)
      .then((result) => { if (!cancelled) { setRows(result); setLoadedScope(scope); } })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : t('errors.searchFailed')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [warehouseId, locationId, revision, scope, t]);
  const items = useMemo(() => [...new Map(rows.map((r) => [r.item_id, r])).values()], [rows]);
  const itemRows = useMemo(() => rows.filter((r) => r.item_id === itemId), [rows, itemId]);
  const colors = useMemo(() => [...new Map(itemRows.map((r) => [r.color_id, r])).values()], [itemRows]);
  const ids = useMemo(() => new Set(selected.map((r) => r.id)), [selected]);
  const groups = useMemo(() => groupTransferRolls(selected), [selected]);
  const totals = transferTotals(selected);
  const blocked = disabled || loading || Boolean(error) || !warehouseId || loadedScope !== scope;
  const color = (r: FabricRollDto) => (i18n.language.startsWith('tr') ? r.color_name_tr || r.color_name_ar : r.color_name_ar || r.color_name_tr) || t('bulk.noColor');
  const number = (n: number) => n.toLocaleString(i18n.language, { maximumFractionDigits: 3 });
  const add = (additions: FabricRollDto[]) => onChange(mergeTransferSelection(selected, additions));
  const remove = (removals: FabricRollDto[]) => { const removeIds = new Set(removals.map((r) => r.id)); onChange(selected.filter((r) => !removeIds.has(r.id))); };
  return <section data-testid="transfer-fabric-selection" className="space-y-3 rounded-lg border border-indigo-100 p-3">
    <div className="flex flex-wrap gap-2">{['single', 'multiple', 'entire', 'color'].map((value) => <button
      key={value} type="button" disabled={disabled} data-testid={`transfer-mode-${value}`} aria-pressed={mode === value}
      onClick={() => setMode(value)} className={`rounded-lg border px-3 py-2 text-sm ${mode === value ? 'bg-indigo-600 text-white' : 'bg-white'}`}>{t(`bulk.${value}`)}</button>)}</div>
    {loading && <p role="status">{t('bulk.loading')}</p>}
    {error && <p role="alert" className="text-rose-700">{error}</p>}
    {mode !== 'single' && <>
      <label className="block text-sm">{t('bulk.fabric')}<select data-testid="transfer-fabric" value={itemId} disabled={blocked} onChange={(e) => setItemId(e.target.value)} className="mx-2 rounded border p-2">
        <option value="">{t('form.chooseOption')}</option>{items.map((r) => <option key={r.item_id} value={r.item_id}>{r.item_name} — {r.internal_code}</option>)}
      </select></label>
      {mode === 'multiple' && <div className="flex flex-wrap gap-3">{items.map((item) => {
        const fabricRows = rows.filter((r) => r.item_id === item.item_id);
        return <label key={item.item_id}><input type="checkbox" data-testid={`transfer-item-${item.item_id}`} disabled={blocked}
          checked={fabricRows.every((r) => ids.has(r.id))} onChange={(e) => e.target.checked ? add(fabricRows) : remove(fabricRows)} /> {item.item_name} — {item.internal_code} ({fabricRows.length})</label>;
      })}</div>}
      {mode === 'entire' && <button type="button" data-testid="transfer-add-fabric" disabled={blocked || !itemId} onClick={() => add(itemRows)} className="rounded border p-2">{t('bulk.selectFabric', { count: itemRows.length })}</button>}
      {mode === 'color' && itemId && <div className="flex flex-wrap gap-3">{colors.map((c) => {
        const colorRows = transferColorRolls(rows, itemId, c.color_id);
        return <label key={c.color_id ?? 'none'}><input type="checkbox" data-testid={`transfer-color-${c.color_id ?? 'none'}`} disabled={blocked}
          checked={colorRows.every((r) => ids.has(r.id))} onChange={(e) => e.target.checked ? add(colorRows) : remove(colorRows)} /> {color(c)} — {c.color_code} ({colorRows.length})</label>;
      })}</div>}
      <p className="text-xs text-slate-500">{t('bulk.keepPrevious')}</p>
    </>}
    <div className="flex gap-3">
      <button type="button" data-testid="transfer-select-all" disabled={blocked || !rows.length} onClick={() => add(rows)} className="rounded border p-2">{t('bulk.selectAll', { count: rows.length })}</button>
      <button type="button" data-testid="transfer-clear" disabled={disabled} onClick={() => onChange([])} className="rounded border p-2">{t('bulk.clear')}</button>
    </div>
    <p data-testid="transfer-totals" data-count={selected.length} className="font-bold">{t('bulk.totals', { count: totals.rolls, meters: number(totals.meters), kg: number(totals.kilograms) })}</p>
    {(totals.unknownWeight > 0 || totals.estimatedWeight > 0) && <p className="text-xs text-amber-700">{t('bulk.weightNote', { unknown: totals.unknownWeight, estimated: totals.estimatedWeight })}</p>}
    {groups.map((group) => <div key={`${group[0].item_id}:${group[0].color_id}`} className="overflow-x-auto rounded border p-2">
      <h4 className="font-bold">{group[0].item_name} — {group[0].internal_code} — {color(group[0])}</h4>
      <p className="text-xs">{t('bulk.totals', { count: group.length, meters: number(transferTotals(group).meters), kg: number(transferTotals(group).kilograms) })}</p>
      <table className="w-full text-right text-xs"><thead><tr>{['colBarcode', 'colMaterial', 'colColor', 'colMeter', 'colWeight', 'colWarehouse', 'colLocation'].map((key) => <th className="p-2" key={key}>{t(`form.${key}`)}</th>)}<th>{t('form.remove')}</th></tr></thead><tbody>
        {group.map((r) => <tr className="border-t" key={r.id}><td className="p-2">{r.barcode}</td><td>{r.item_name} / {r.internal_code}</td><td>{color(r)} / {r.color_code}</td><td>{number(Number(r.length_m))}</td>
          <td>{r.actual_weight_kg != null ? number(Number(r.actual_weight_kg)) : r.calculated_weight_kg != null ? `${number(Number(r.calculated_weight_kg))} (${t('bulk.estimated')})` : t('bulk.unknown')}</td>
          <td>{r.warehouse_name}</td><td>{r.location_name || '—'}</td><td><button type="button" data-testid={`transfer-remove-${r.id}`} disabled={disabled} onClick={() => remove([r])}>{t('form.remove')}</button></td></tr>)}
      </tbody></table>
    </div>)}
  </section>;
}
