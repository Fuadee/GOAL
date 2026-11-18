'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, List, Plus, Trash2, X } from 'lucide-react';
import { deleteGrowthAssetAction, upsertGrowthAssetAction } from '@/app/money-management/actions';
import { assetLabels, assetValue, packAssets } from '@/lib/money/asset-bubbles';
import { GROWTH_ASSET_TYPES, type GrowthAssetRow, type GrowthAssetType } from '@/lib/money/types';
import s from './crystal-assets.module.css';

const amount = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 });
const bahtSymbol = '฿';
const baht = (value: number) => bahtSymbol + amount.format(value);

function BahtAmount({ value }: { value: number }) {
  return <><span className={s.currency}>{bahtSymbol}</span>{amount.format(value)}</>;
}
function tint(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ['blue', 'mint', 'lilac'][hash % 3];
}

export function CrystalAssets({ rows, loadFailed }: { rows: GrowthAssetRow[]; loadFailed?: boolean }) {
  const router = useRouter();
  const [refreshing, refresh] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [editor, setEditor] = useState<GrowthAssetRow | 'new' | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  const stage = useRef<HTMLDivElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadFailed]);
  const points = useMemo(
    () =>
      rows.map((row) => {
        const value = assetValue(row);
        return { id: row.id, value, minDiameter: Math.max(54, baht(value).length * 7 + 7) };
      }),
    [rows],
  );
  const byId = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const total = points.reduce((sum, p) => sum + p.value, 0);
  const profit = rows.reduce(
    (sum, row) => sum + (row.asset_type === 'receivable' ? 0 : Number(row.profit_loss)),
    0,
  );
  const layout = useMemo(() => packAssets(points, width), [points, width]);
  const largest = points.reduce<(typeof points)[number] | undefined>(
    (best, point) =>
      point.value > 0 &&
      (!best ||
        point.value > best.value ||
        (point.value === best.value && point.id.localeCompare(best.id) < 0))
        ? point
        : best,
    undefined,
  );
  const chartIds = new Set(layout.circles.map((circle) => circle.id));
  const compactRows = width ? rows.filter((row) => !chartIds.has(row.id)) : [];
  function open(row: GrowthAssetRow | 'new') {
    setNotice('');
    setEditor(row);
  }
  return (
    <section className={s.card} aria-labelledby="asset-title">
      <header className={s.header}>
        <div>
          <h2 id="asset-title">สินทรัพย์ของฉัน</h2>
          {!loadFailed && (
            <>
              <div className={s.total}>
                <BahtAmount value={total} />
              </div>
              <p>มูลค่าปัจจุบันทั้งหมด</p>
            </>
          )}
        </div>
        {!loadFailed && (
          <button ref={addButton} className={s.primary} onClick={() => open('new')}>
            <Plus size={17} /> เพิ่มสินทรัพย์
          </button>
        )}
      </header>
      {loadFailed ? (
        <div className={s.empty} role="alert">
          โหลดข้อมูลสินทรัพย์ไม่สำเร็จ{' '}
          <button disabled={refreshing} onClick={() => refresh(() => router.refresh())}>
            {refreshing ? 'กำลังโหลด…' : 'ลองอีกครั้ง'}
          </button>
        </div>
      ) : (
        <>
          <div
            ref={stage}
            className={s.stage}
            style={{ height: layout.height || undefined }}
            aria-busy={rows.length > 0 && !width}
            aria-label="สัดส่วนสินทรัพย์"
          >
            {layout.circles.map((c) => {
              const row = byId.get(c.id)!;
              const d = c.r * 2;
              const value = baht(c.value);
              return (
                <button
                  key={c.id}
                  className={s.bubble}
                  data-tint={largest?.id === c.id ? 'indigo' : tint(c.id)}
                  style={
                    {
                      width: d,
                      height: d,
                      left: c.x - c.r,
                      top: c.y - c.r,
                      '--amount-chars': value.length,
                    } as CSSProperties
                  }
                  aria-label={row.asset_name + ' ' + value}
                  title={row.asset_name + ' · ' + value}
                  data-selected={editor !== 'new' && editor?.id === c.id}
                  onClick={() => open(row)}
                >
                  <span className={s.caption}>
                    <span>{row.asset_name}</span>
                    <strong><BahtAmount value={c.value} /></strong>
                    {row.asset_type === 'receivable' ? (
                      <small>รอรับคืน</small>
                    ) : (
                      d >= 148 && total > 0 && <small>{amount.format((c.value / total) * 100)}%</small>
                    )}
                  </span>
                </button>
              );
            })}
            {(!rows.length || !width) && (
              <p className={s.empty}>{rows.length ? 'กำลังจัดวางสินทรัพย์…' : 'ยังไม่มีสินทรัพย์'}</p>
            )}
          </div>
          {compactRows.length > 0 && (
            <div className={s.compactAssets}>
              {compactRows.map((row) => (
                <button
                  key={row.id}
                  className={s.assetPill}
                  data-tint={tint(row.id)}
                  onClick={() => open(row)}
                >
                  <span className={s.assetSwatch} aria-hidden="true" />
                  <span className={s.pillName}>
                    {row.asset_name}
                    {row.asset_type === 'receivable' && <small>รอรับคืน</small>}
                  </span>
                  <strong><BahtAmount value={assetValue(row)} /></strong>
                </button>
              ))}
            </div>
          )}
          <footer className={s.footer}>
            <div>
              <b>{rows.length} รายการ</b>
              <span>แตะวงเพื่ออัปเดตยอด</span>
            </div>
            <button
              aria-expanded={expanded}
              aria-controls="asset-list"
              onClick={() => setExpanded(!expanded)}
            >
              <List size={16} /> ดูรายการทั้งหมด <ChevronDown size={15} />
            </button>
          </footer>
          <div id="asset-list" hidden={!expanded} className={s.list}>
            <p>
              กำไร/ขาดทุนรวม <strong>{baht(profit)}</strong> (
              {amount.format(total > 0 ? (profit / total) * 100 : 0)}%)
            </p>
            <table>
              <thead>
                <tr>
                  {['สินทรัพย์', 'ประเภท', 'มูลค่าปัจจุบัน', 'กำไร/ขาดทุน', 'ผลตอบแทน', 'จัดการ'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.asset_name}</th>
                    <td data-label="ประเภท">{assetLabels[row.asset_type]}</td>
                    <td data-label="มูลค่าปัจจุบัน">{baht(assetValue(row))}</td>
                    <td data-label="กำไร/ขาดทุน">
                      {row.asset_type === 'receivable' ? 'รอรับคืน' : baht(row.profit_loss)}
                    </td>
                    <td data-label="ผลตอบแทน">
                      {row.asset_type === 'receivable'
                        ? 'รอชำระคืน'
                        : amount.format(row.return_percent) + '%'}
                    </td>
                    <td>
                      <button aria-label={'จัดการ ' + row.asset_name} onClick={() => open(row)}>
                        แก้ไข / ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <div className={s.notice} role="status" aria-atomic="true">
        {notice && <span><Check size={16} aria-hidden="true" />{notice}</span>}
      </div>
      {editor && (
        <AssetEditor
          row={editor === 'new' ? null : editor}
          peak={Math.max(1, largest?.value ?? 0)}
          color={editor === 'new' || editor.id === largest?.id ? 'indigo' : tint(editor.id)}
          onClose={() => setEditor(null)}
          onSaved={(message) => {
            setEditor(null);
            setNotice(message);
            router.refresh();
            addButton.current?.focus();
          }}
        />
      )}
    </section>
  );
}

function AssetEditor({
  row,
  peak,
  color,
  onClose,
  onSaved,
}: {
  row: GrowthAssetRow | null;
  peak: number;
  color: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState(row?.asset_name ?? '');
  const [type, setType] = useState<GrowthAssetType>(row?.asset_type ?? 'investment');
  const [cost, setCost] = useState(String(row?.invested_amount ?? ''));
  const [current, setCurrent] = useState(String(row?.current_value ?? ''));
  const value = Number(current);
  // Reserve headroom so increasing even the largest existing asset changes its preview.
  const reference = row && assetValue(row) > 0 ? assetValue(row) : Math.max(peak, Number(cost));
  const size = 112 * Math.sqrt(Math.max(0, value) / (reference + Math.max(0, value)));
  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    return () => el.close();
  }, []);
  async function mutate(data?: FormData) {
    if (lock.current) return;
    if (!data && (!row || !window.confirm('ลบสินทรัพย์ “' + row.asset_name + '” หรือไม่?'))) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const result = data ? await upsertGrowthAssetAction(data) : await deleteGrowthAssetAction(row!.id);
      if (result.success) onSaved(result.message);
      else setError(result.message);
    } catch {
      setError('เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      aria-labelledby="asset-editor-title"
      className={s.dialog}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <header>
        <h3 id="asset-editor-title">{row ? 'อัปเดตสินทรัพย์' : 'เพิ่มสินทรัพย์'}</h3>
        <button aria-label="ปิด" disabled={busy} onClick={onClose}>
          <X size={18} />
        </button>
      </header>
      <div className={s.preview}>
        <div className={s.sample}>
          <i data-tint={color} style={{ width: size, height: size }} />
        </div>
        <div>
          <small>ตัวอย่างก่อนบันทึก</small>
          <b>{name || 'สินทรัพย์ใหม่'}</b>
          <strong><BahtAmount value={value} /></strong>
          {type === 'receivable' && <small>รอรับคืน</small>}
        </div>
      </div>
      <form
        aria-busy={busy}
        onSubmit={(e) => {
          e.preventDefault();
          void mutate(new FormData(e.currentTarget));
        }}
      >
        <fieldset disabled={busy}>
          {row && <input type="hidden" name="id" value={row.id} />}
          <label>
            ชื่อสินทรัพย์
            <input required name="asset_name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            ประเภท
            <select
              name="asset_type"
              value={type}
              onChange={(e) => setType(e.target.value as GrowthAssetType)}
            >
              {GROWTH_ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {assetLabels[t]}
                </option>
              ))}
            </select>
          </label>
          <label>
            เงินต้น (฿)
            <input
              required
              type="number"
              inputMode="decimal"
              step=".01"
              min="0"
              name="invested_amount"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </label>
          <label>
            มูลค่าปัจจุบัน (฿)
            <input
              required
              type="number"
              inputMode="decimal"
              step=".01"
              min="0"
              name="current_value"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </label>
        </fieldset>
        {row && row.asset_type !== 'receivable' && (
          <p className={s.savedReturn}>
            กำไร/ขาดทุนที่บันทึกไว้ {baht(row.profit_loss)} ({amount.format(row.return_percent)}%)
          </p>
        )}
        {error && (
          <p role="alert" className={s.error}>
            {error}
          </p>
        )}
        <div className={s.actions}>
          {row && (
            <button type="button" disabled={busy} onClick={() => void mutate()}>
              <Trash2 size={16} /> ลบ
            </button>
          )}
          <button type="button" disabled={busy} onClick={onClose}>
            ยกเลิก
          </button>
          <button disabled={busy} className={s.primary}>
            {busy ? 'กำลังดำเนินการ…' : 'บันทึก'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
