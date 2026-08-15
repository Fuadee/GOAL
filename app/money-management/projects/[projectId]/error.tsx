'use client';

export default function ProjectBudgetError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-[70vh] items-center justify-center bg-[#F8FAFC] p-4">
    <section className="w-full max-w-lg rounded-[24px] border border-rose-200 bg-white p-6 text-center shadow-sm" role="alert">
      <h1 className="text-xl font-semibold text-slate-900">โหลดข้อมูลงบประมาณไม่สำเร็จ</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">เกิดข้อผิดพลาดระหว่างโหลดรายการจ่าย กรุณาลองใหม่อีกครั้ง</p>
      <button type="button" onClick={reset} className="theme-button-primary mt-5 !text-white" style={{ color: '#FFFFFF' }}>ลองใหม่</button>
    </section>
  </main>;
}
