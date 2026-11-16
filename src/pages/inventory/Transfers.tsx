import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, Plus, QrCode, Search, ArrowRight, X } from 'lucide-react';
import type { FabricRollDto } from '../../lib/api/fabricRollsApi';
import { TransferFabricSelection } from '../../components/TransferFabricSelection';
import { eligibleTransferRoll } from '../../lib/inventory/transferSelection';
import { listLocations, listWarehouses, type ApiWarehouse, type ApiWarehouseLocation } from '../../lib/api/warehousesApi';
import {
  listInventoryTransfers,
  createInventoryTransfer,
  confirmInventoryTransfer,
  cancelInventoryTransfer,
  getInventoryTransfer,
  listEligibleTransferRolls,
  type InventoryTransferDetail,
  type InventoryTransferRow,
} from '../../lib/api/inventoryTransfersApi';
import { ApiRequestError } from '../../lib/api/client';
import i18n from '../../i18n/config';

const getStatusLabels = (): Record<string, string> => ({
  DRAFT: i18n.t('status.draft', { ns: 'transfers' }),
  CONFIRMED: i18n.t('status.confirmed', { ns: 'transfers' }),
  CANCELLED: i18n.t('status.cancelled', { ns: 'transfers' }),
});

const STATUS_CLASS: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-slate-200 text-slate-700',
};

function warehouseOptionLabel(w: ApiWarehouse): string {
  return w.code ? `${w.name} (${w.code})` : w.name;
}

function findRollInResults(code: string, rolls: FabricRollDto[]): FabricRollDto | undefined {
  const norm = code.trim().toLowerCase();
  if (!norm) return undefined;
  return (
    rolls.find((r) => r.barcode.toLowerCase() === norm) ??
    rolls.find((r) => r.roll_no?.toLowerCase() === norm)
  );
}

export const Transfers = () => {
  const { t } = useTranslation('transfers');
  const scanRef = useRef<HTMLInputElement>(null);

  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([]);
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [fromLocations, setFromLocations] = useState<ApiWarehouseLocation[]>([]);
  const [toLocations, setToLocations] = useState<ApiWarehouseLocation[]>([]);
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [selectedRolls, setSelectedRolls] = useState<FabricRollDto[]>([]);
  const [availableTotal, setAvailableTotal] = useState<number | null>(null);
  const [scanInput, setScanInput] = useState('');
  const [scanBusy, setScanBusy] = useState(false);
  const [rollSearch, setRollSearch] = useState('');
  const [rollSearchDebounced, setRollSearchDebounced] = useState('');
  const [searchResults, setSearchResults] = useState<FabricRollDto[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<InventoryTransferRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [listFromWarehouseId, setListFromWarehouseId] = useState('');
  const [listToWarehouseId, setListToWarehouseId] = useState('');
  const [bus, setBus] = useState({ list: false, create: false, act: null as string | null });
  const [err, setErr] = useState<string | null>(null);
  const [scanHint, setScanHint] = useState<string | null>(null);
  const [rollRefresh, setRollRefresh] = useState(0);
  const [review, setReview] = useState<InventoryTransferDetail | null>(null);
  const operationLock = useRef(false);
  const pendingRequest = useRef<{ signature: string; key: string } | null>(null);
  const sourceScope = useRef('');
  sourceScope.current = `${fromWarehouseId}:${fromLocationId}`;

  const selectedIds = useMemo(() => new Set(selectedRolls.map((r) => r.id)), [selectedRolls]);

  const loadList = useCallback(async () => {
    setErr(null);
    setBus((b) => ({ ...b, list: true }));
    try {
      const res = await listInventoryTransfers({
        search: search.trim() || undefined,
        fromWarehouseId: listFromWarehouseId || undefined,
        toWarehouseId: listToWarehouseId || undefined,
        page: 1,
        pageSize: 50,
      });
      setRows(res.data);
      setTotal(res.total);
    } catch (e) {
      setErr(e instanceof ApiRequestError ? e.message : t('errors.loadListFailed'));
    } finally {
      setBus((b) => ({ ...b, list: false }));
    }
  }, [search, listFromWarehouseId, listToWarehouseId, t]);

  useEffect(() => {
    void (async () => {
      try {
        const w = await listWarehouses({ status: 'active' });
        setWarehouses(w);
      } catch {
        setWarehouses([]);
      }
    })();
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!fromWarehouseId) {
      setFromLocations([]);
      setFromLocationId('');
      setSelectedRolls([]);
      setAvailableTotal(null);
      setSearchResults([]);
      setSearchTotal(0);
      setRollSearch('');
      setRollSearchDebounced('');
      return;
    }
    let cancelled = false;
    void listLocations(fromWarehouseId)
      .then((locs) => {
        if (!cancelled) {
          setFromLocations(locs);
        }
      })
      .catch(() => {
        if (!cancelled) setFromLocations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fromWarehouseId]);

  useEffect(() => {
    if (!fromWarehouseId) return;
    let cancelled = false;
    void listEligibleTransferRolls({
      warehouseId: fromWarehouseId,
      locationId: fromLocationId || undefined,
      page: 1,
      pageSize: 1,
    })
      .then((res) => {
        if (!cancelled) setAvailableTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) setAvailableTotal(null);
      });
    setSelectedRolls([]);
    setSearchResults([]);
    setSearchTotal(0);
    return () => {
      cancelled = true;
    };
  }, [fromWarehouseId, fromLocationId, rollRefresh]);

  useEffect(() => {
    const t = window.setTimeout(() => setRollSearchDebounced(rollSearch.trim()), 350);
    return () => window.clearTimeout(t);
  }, [rollSearch]);

  useEffect(() => {
    if (!fromWarehouseId || rollSearchDebounced.length < 2) {
      setSearchResults([]);
      setSearchTotal(0);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    void listEligibleTransferRolls({
      warehouseId: fromWarehouseId,
      locationId: fromLocationId || undefined,
      search: rollSearchDebounced,
      page: 1,
      pageSize: 50,
    })
      .then((res) => {
        if (cancelled) return;
        setSearchResults(res.data);
        setSearchTotal(res.total);
      })
      .catch(() => {
        if (!cancelled) {
          setSearchResults([]);
          setSearchTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fromWarehouseId, fromLocationId, rollSearchDebounced, rollRefresh]);

  useEffect(() => {
    let cancelled = false;
    setToLocations([]);
    setToLocationId('');
    if (!toWarehouseId) {
      setToLocations([]);
      setToLocationId('');
      return;
    }
    void (async () => {
      try {
        const locs = await listLocations(toWarehouseId);
        if (cancelled) return;
        setToLocations(locs);
        setToLocationId('');
      } catch {
        if (!cancelled) setToLocations([]);
      }
    })();
    return () => { cancelled = true; };
  }, [toWarehouseId]);

  const addRoll = useCallback((roll: FabricRollDto) => {
    if (!eligibleTransferRoll(roll, fromWarehouseId, fromLocationId)) { setErr(t('errors.rollNotFound')); return; }
    setSelectedRolls((prev) => {
      if (prev.some((r) => r.id === roll.id)) return prev;
      return [...prev, roll];
    });
    setScanHint(t('scan.addedPrefix', { barcode: roll.barcode }));
    setErr(null);
  }, [t, fromWarehouseId, fromLocationId]);

  const handleScanCommit = async () => {
    if (scanBusy || operationLock.current) return;
    const requestedScope = sourceScope.current;
    const code = scanInput.trim();
    if (!code) return;
    if (!fromWarehouseId) {
      setErr(t('errors.chooseSourceFirst'));
      return;
    }
    setScanBusy(true);
    setScanHint(null);
    try {
      const res = await listEligibleTransferRolls({
        warehouseId: fromWarehouseId,
        locationId: fromLocationId || undefined,
        barcode: code,
        pageSize: 25,
        page: 1,
      });
      if (requestedScope !== sourceScope.current) return;
      const roll = findRollInResults(code, res.data);
      if (!roll) {
        setErr(t('errors.rollNotFound'));
        return;
      }
      if (selectedIds.has(roll.id)) {
        setScanHint(t('scan.alreadyAdded', { barcode: roll.barcode }));
        setScanInput('');
        scanRef.current?.focus();
        return;
      }
      addRoll(roll);
      setScanInput('');
      scanRef.current?.focus();
    } catch (e) {
      setErr(e instanceof ApiRequestError ? e.message : t('errors.searchFailed'));
    } finally {
      setScanBusy(false);
    }
  };

  const destinationWarehouses = useMemo(
    () => warehouses.filter((w) => w.id !== fromWarehouseId),
    [warehouses, fromWarehouseId],
  );

  const handleCreate = async () => {
    if (operationLock.current) return;
    setErr(null);
    if (!fromWarehouseId || !toWarehouseId) {
      setErr(t('errors.chooseSourceAndDestination'));
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      setErr(t('errors.sourceDestinationSame'));
      return;
    }
    if (selectedRolls.length === 0) {
      setErr(t('errors.addAtLeastOneRoll'));
      return;
    }
    const payload = { fromWarehouseId, fromLocationId: fromLocationId || null, toWarehouseId, toLocationId: toLocationId || null,
      notes: notes.trim() || null, lines: [...selectedRolls].sort((a,b) => a.id.localeCompare(b.id)).map((r) => ({ fabricRollId: r.id, quantity: 1 })) };
    const signature = JSON.stringify(payload);
    const pending = pendingRequest.current?.signature === signature ? pendingRequest.current : { signature, key: crypto.randomUUID() };
    pendingRequest.current = pending;
    operationLock.current = true;
    setBus((b) => ({ ...b, create: true }));
    try {
      await createInventoryTransfer({ ...payload, clientRequestId: pending.key });
      pendingRequest.current = null;
      setNotes('');
      setSelectedRolls([]);
      setScanInput('');
      setRollSearch('');
      await loadList();
    } catch (e) {
      setErr(e instanceof ApiRequestError ? e.message : t('errors.createFailed'));
    } finally {
      operationLock.current = false;
      setBus((b) => ({ ...b, create: false }));
    }
  };

  const handleConfirm = async (id: string, approved = false) => {
    if (operationLock.current) return;
    operationLock.current = true;
    setErr(null);
    setBus((b) => ({ ...b, act: id }));
    try {
      if (!approved) {
        const result = await getInventoryTransfer(id);
        setReview(result.data);
        return;
      }
      if (review?.id !== id) return;
      await confirmInventoryTransfer(id, review.updated_at);
      setReview(null);
      setRollRefresh((value) => value + 1);
      await loadList();
    } catch (e) {
      setErr(e instanceof ApiRequestError ? e.message : t('errors.confirmFailed'));
    } finally {
      operationLock.current = false;
      setBus((b) => ({ ...b, act: null }));
    }
  };

  const handleCancel = async (id: string) => {
    if (operationLock.current) return;
    operationLock.current = true;
    setErr(null);
    setBus((b) => ({ ...b, act: id }));
    try {
      await cancelInventoryTransfer(id);
      await loadList();
    } catch (e) {
      setErr(e instanceof ApiRequestError ? e.message : t('errors.cancelFailed'));
    } finally {
      operationLock.current = false;
      setBus((b) => ({ ...b, act: null }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('page.title')}</h2>
          <p className="text-slate-500 mt-1">{t('page.subtitle')}</p>
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm">{err}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">{t('form.newTransferTitle')}</h3>
        </div>

        <fieldset disabled={bus.create || bus.act !== null || Boolean(review)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">{t('form.sourceWarehouseLabel')}</label>
              <select
                data-testid="transfer-source"
                value={fromWarehouseId}
                onChange={(e) => { setSelectedRolls([]); setFromLocationId(''); setFromWarehouseId(e.target.value); }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{t('form.chooseOption')}</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {warehouseOptionLabel(w)}
                  </option>
                ))}
              </select>
            </div>

            {fromWarehouseId ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('form.sourceLocationLabel')}</label>
                <select
                  data-testid="transfer-source-location"
                  value={fromLocationId}
                  onChange={(e) => { setSelectedRolls([]); setFromLocationId(e.target.value); }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{t('form.allLocationsOption')}</option>
                  {fromLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="hidden xl:block" />
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">{t('form.destinationWarehouseLabel')}</label>
              <select
                data-testid="transfer-destination"
                value={toWarehouseId}
                onChange={(e) => setToWarehouseId(e.target.value)}
                disabled={!fromWarehouseId}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">{t('form.chooseOption')}</option>
                {destinationWarehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {warehouseOptionLabel(w)}
                  </option>
                ))}
              </select>
            </div>

            {toWarehouseId ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('form.destinationLocationLabel')}</label>
                <select
                  value={toLocationId}
                  onChange={(e) => setToLocationId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{t('form.noSpecificLocationOption')}</option>
                  {toLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>

          {fromWarehouseId && fromWarehouseId === toWarehouseId ? (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {t('form.sameWarehouseWarning')}
            </p>
          ) : null}

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-bold text-slate-900">{t('form.selectRollsTitle')}</h4>
              {fromWarehouseId && availableTotal != null ? (
                <span className="text-xs text-slate-500">
                  {t('form.availableRollsCount', { count: availableTotal.toLocaleString() })}
                  {selectedRolls.length > 0 ? (
                    <span className="text-indigo-600 font-medium mr-2">
                      {t('form.selectedForTransferCount', { count: selectedRolls.length.toLocaleString() })}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  {t('form.scanLabel')}
                </label>
                <div className="flex gap-2">
                  <input
                    ref={scanRef}
                    data-testid="transfer-barcode"
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void handleScanCommit();
                      }
                    }}
                    disabled={!fromWarehouseId || scanBusy}
                    placeholder={fromWarehouseId ? t('form.scanPlaceholderReady') : t('form.scanPlaceholderChooseSource')}
                    className="flex-1 p-3 bg-indigo-50/50 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm disabled:opacity-50"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => void handleScanCommit()}
                    disabled={!fromWarehouseId || !scanInput.trim() || scanBusy}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {scanBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {t('form.addButton')}
                  </button>
                </div>
                {scanHint ? <p className="text-xs text-emerald-700">{scanHint}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-500" />
                  {t('form.searchLabel')}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="text"
                    value={rollSearch}
                    data-testid="transfer-search"
                    onChange={(e) => setRollSearch(e.target.value)}
                    disabled={!fromWarehouseId}
                    placeholder={fromWarehouseId ? t('form.searchPlaceholderReady') : t('form.searchPlaceholderChooseSource')}
                    className="w-full pr-9 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {fromWarehouseId && rollSearchDebounced.length >= 2 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex justify-between">
                  <span>{t('form.searchResultsLabel')}</span>
                  <span>
                    {searchLoading ? t('form.searching') : t('form.resultsCount', { count: searchTotal.toLocaleString() })}
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 font-medium">{t('form.colBarcode')}</th>
                        <th className="px-3 py-2 font-medium">{t('form.colMaterial')}</th>
                        <th className="px-3 py-2 font-medium">{t('form.colColor')}</th>
                        <th className="px-3 py-2 font-medium">{t('form.colMeter')}</th>
                        <th className="px-3 py-2 w-16" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {searchLoading ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                            <Loader2 className="w-5 h-5 animate-spin inline text-indigo-500" />
                          </td>
                        </tr>
                      ) : searchResults.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                            {t('form.noResults')}
                          </td>
                        </tr>
                      ) : (
                        searchResults.map((r) => {
                          const picked = selectedIds.has(r.id);
                          return (
                            <tr key={r.id} className={picked ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}>
                              <td className="px-3 py-2 font-mono font-medium text-indigo-700">{r.barcode}</td>
                              <td className="px-3 py-2">{r.item_name ?? '—'}</td>
                              <td className="px-3 py-2">{r.color_name_ar ?? r.color_code ?? '—'}</td>
                              <td className="px-3 py-2">{r.length_m}</td>
                              <td className="px-3 py-2 text-left">
                                <button
                                  type="button"
                                  disabled={picked}
                                  onClick={() => addRoll(r)}
                                  className="text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 font-medium"
                                >
                                  {picked ? '✓' : '+'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : fromWarehouseId ? (
              <p className="text-xs text-slate-400">
                {t('form.searchHint')}
              </p>
            ) : null}

            <TransferFabricSelection warehouseId={fromWarehouseId} locationId={fromLocationId} selected={selectedRolls}
              onChange={setSelectedRolls} disabled={bus.create || bus.act !== null} revision={rollRefresh} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end border-t border-slate-100 pt-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">{t('form.notesLabel')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder={t('form.notesPlaceholder')}
              />
            </div>
            <button
              type="button"
              onClick={() => void handleCreate()}
              data-testid="transfer-save"
              disabled={bus.create || !fromWarehouseId || !toWarehouseId}
              className="md:min-w-[200px] bg-indigo-600 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition font-medium disabled:opacity-60"
            >
              {bus.create ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {t('form.saveDraftButton')}
            </button>
          </div>
        </fieldset>
      </div>

      {review && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
        <div className="mx-auto max-w-6xl space-y-3 rounded-xl bg-white p-5">
          <h3 className="font-bold">{t('bulk.review')} — {review.transfer_no}</h3>
          <TransferFabricSelection warehouseId={review.from_warehouse_id} locationId={review.from_location_id || ''}
            selected={review.lines.map((line) => line.roll)} onChange={() => {}} disabled revision={rollRefresh} />
          <button type="button" data-testid="transfer-confirm-reviewed" disabled={bus.act !== null} onClick={() => void handleConfirm(review.id, true)} className="rounded bg-emerald-600 px-4 py-2 text-white">{t('list.confirmButton')}</button>
          <button type="button" disabled={bus.act !== null} onClick={() => setReview(null)} className="mx-3 rounded border p-2">{t('bulk.close')}</button>
        </div>
      </div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50 flex-wrap">
          <h3 className="font-bold text-slate-900">{t('list.title')}</h3>
          <span className="text-xs text-slate-500">({total})</span>
          <select
            data-testid="transfer-list-source"
            value={listFromWarehouseId}
            onChange={(e) => setListFromWarehouseId(e.target.value)}
            className="text-sm px-2 py-2 bg-white border border-slate-200 rounded-lg min-w-[140px]"
          >
            <option value="">{t('list.fromAllWarehouses')}</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {warehouseOptionLabel(w)}
              </option>
            ))}
          </select>
          <select
            data-testid="transfer-list-destination"
            value={listToWarehouseId}
            onChange={(e) => setListToWarehouseId(e.target.value)}
            className="text-sm px-2 py-2 bg-white border border-slate-200 rounded-lg min-w-[140px]"
          >
            <option value="">{t('list.toAllWarehouses')}</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {warehouseOptionLabel(w)}
              </option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('list.searchPlaceholder')}
              className="w-full pr-9 pl-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => void loadList()}
            className="text-sm px-3 py-2 border border-slate-200 rounded-lg hover:bg-white bg-white"
          >
            {t('list.refresh')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-800 text-slate-100 font-medium">
              <tr>
                <th className="px-4 py-4">{t('list.colTransferNo')}</th>
                <th className="px-4 py-4">{t('list.colFromWarehouse')}</th>
                <th className="px-4 py-4">{t('list.colToWarehouse')}</th>
                <th className="px-4 py-4">{t('list.colItemsTransferred')}</th>
                <th className="px-4 py-4">{t('list.colStatus')}</th>
                <th className="px-4 py-4 w-40">{t('list.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bus.list ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin inline text-indigo-500" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-600 font-medium">
                    {t('list.noTransfers')}
                  </td>
                </tr>
              ) : (
                rows.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50 transition-colors bg-white">
                    <td className="px-4 py-4 font-medium text-indigo-600">{tr.transfer_no}</td>
                    <td className="px-4 py-4 font-medium text-slate-700">{tr.from_warehouse_name ?? '—'}</td>
                    <td className="px-4 py-4 font-medium text-slate-700">{tr.to_warehouse_name ?? '—'}</td>
                    <td className="px-4 py-4 text-slate-600">{t('list.unitCount', { count: (tr.line_count ?? 0).toLocaleString() })}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${STATUS_CLASS[tr.status] ?? 'bg-slate-100'}`}
                      >
                        {getStatusLabels()[tr.status] ?? tr.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {tr.status === 'DRAFT' ? (
                        <div className="flex flex-wrap gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => void handleConfirm(tr.id)}
                            disabled={bus.act === tr.id}
                            className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {t('list.confirmButton')}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCancel(tr.id)}
                            disabled={bus.act === tr.id}
                            className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            {t('list.cancelButton')}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
