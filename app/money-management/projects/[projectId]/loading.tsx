export default function ProjectBudgetLoading() {
  return <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 sm:px-6 lg:px-8" aria-busy="true" aria-label="กำลังโหลด Project Budget Monitor">
    <div className="mx-auto w-full max-w-[1440px] animate-pulse overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6"><div className="h-4 w-40 rounded bg-slate-200" /><div className="mt-3 h-8 w-72 max-w-full rounded bg-slate-200" /><div className="mt-2 h-4 w-96 max-w-full rounded bg-slate-100" /></div>
      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-24 rounded-2xl bg-slate-100" />)}</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div className="h-44 rounded-2xl bg-blue-50" /><div className="h-44 rounded-2xl bg-violet-50" /></div>
        <div className="h-28 rounded-2xl bg-slate-100" />
        <div className="space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-36 rounded-2xl bg-slate-100" />)}</div>
      </div>
    </div>
  </main>;
}
