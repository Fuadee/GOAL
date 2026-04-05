'use client';

import { FormEvent, useMemo, useState } from 'react';

type BloodDonationRecord = {
  id: string;
  donationDate: string;
  note?: string;
};

const ELIGIBLE_INTERVAL_DAYS = 90;

const initialRecords: BloodDonationRecord[] = [
  {
    id: 'donation-2026-01-05',
    donationDate: '2026-01-05',
    note: 'ศูนย์บริการโลหิต สภากาชาดไทย'
  },
  {
    id: 'donation-2025-09-21',
    donationDate: '2025-09-21',
    note: 'บริจาคพร้อมเพื่อนที่โรงพยาบาลใกล้บ้าน'
  }
];

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
};

const formatDate = (value: string) => dateFormatter.format(parseIsoDate(value));

const formatDateInputValue = (value: string) => {
  const date = parseIsoDate(value);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
};

const calculateDayDiff = (start: Date, end: Date) => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((end.getTime() - start.getTime()) / millisecondsPerDay);
};

export function BloodDonationSection() {
  const [records, setRecords] = useState<BloodDonationRecord[]>(initialRecords);
  const [isAdding, setIsAdding] = useState(false);
  const [donationDate, setDonationDate] = useState(formatDateInputValue(new Date().toISOString().slice(0, 10)));
  const [note, setNote] = useState('');

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => parseIsoDate(b.donationDate).getTime() - parseIsoDate(a.donationDate).getTime()),
    [records]
  );

  const summary = useMemo(() => {
    if (!sortedRecords.length) {
      return null;
    }

    const today = new Date();
    const latestRecord = sortedRecords[0];
    const latestDate = parseIsoDate(latestRecord.donationDate);
    const nextEligibleDate = addDays(latestDate, ELIGIBLE_INTERVAL_DAYS);
    const daysRemaining = calculateDayDiff(today, nextEligibleDate);

    const status =
      daysRemaining < 0
        ? `ครบกำหนดแล้ว ${Math.abs(daysRemaining)} วัน`
        : daysRemaining === 0
          ? 'พร้อมบริจาค'
          : `ยังไม่ถึงกำหนด (เหลือ ${daysRemaining} วัน)`;

    return {
      latestDate,
      nextEligibleDate,
      status
    };
  }, [sortedRecords]);

  const handleAddRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!donationDate) {
      return;
    }

    const newRecord: BloodDonationRecord = {
      id: crypto.randomUUID(),
      donationDate,
      note: note.trim() || undefined
    };

    setRecords((prev) => [newRecord, ...prev]);
    setDonationDate(formatDateInputValue(new Date().toISOString().slice(0, 10)));
    setNote('');
    setIsAdding(false);
  };

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">การบริจาคเลือด</h2>
            <p className="text-sm text-slate-300">สรุปสถานะการบริจาคล่าสุดและวันที่พร้อมบริจาคครั้งถัดไป</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding((prev) => !prev)}
            className="rounded-full bg-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/30"
          >
            + เพิ่มข้อมูลบริจาคเลือด
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">ชื่อกิจกรรม</p>
            <p className="mt-2 text-base font-semibold text-white">บริจาคเลือด</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">วันที่บริจาคล่าสุด</p>
            <p className="mt-2 text-base font-semibold text-white">
              {summary ? dateFormatter.format(summary.latestDate) : '-'}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">สถานะ</p>
            <p className="mt-2 text-base font-semibold text-emerald-300">{summary ? summary.status : 'ยังไม่มีข้อมูล'}</p>
            <p className="mt-1 text-xs text-slate-400">
              วันที่เป้าหมาย: {summary ? dateFormatter.format(summary.nextEligibleDate) : '-'}
            </p>
          </div>
        </div>

        {isAdding ? (
          <form onSubmit={handleAddRecord} className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-200">
                <span>วันที่บริจาค</span>
                <input
                  type="date"
                  value={donationDate}
                  onChange={(event) => setDonationDate(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-300"
                  required
                />
              </label>
              <label className="space-y-1 text-sm text-slate-200">
                <span>หมายเหตุสั้น ๆ (ถ้ามี)</span>
                <input
                  type="text"
                  placeholder="เช่น บริจาคที่โรงพยาบาลใกล้บ้าน"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-300"
                />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/30"
              >
                บันทึกข้อมูล
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/20"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        ) : null}
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">ประวัติการบริจาคเลือด</h3>
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300">
            {sortedRecords.length} รายการ
          </span>
        </div>

        {sortedRecords.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-white/20 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-200">ยังไม่มีข้อมูลการบริจาคเลือด</p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-4 rounded-full bg-rose-400/20 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/30"
            >
              + เพิ่มข้อมูลบริจาคเลือด
            </button>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {sortedRecords.map((record) => (
              <li
                key={record.id}
                className="rounded-xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-white/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">บริจาคเลือด</p>
                    <p className="text-xs text-slate-400">{formatDate(record.donationDate)}</p>
                  </div>
                  {record.note ? <p className="max-w-md text-sm text-slate-300">{record.note}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
