import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="grid w-full max-w-[460px] gap-4 rounded-lg border border-slate-200 bg-white p-8">
        <p className="m-0 text-[13px] font-extrabold text-teal-700">404</p>
        <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">页面不存在</h1>
        <Link className="font-bold text-blue-700" to="/dashboard">
          返回工作台
        </Link>
      </section>
    </main>
  )
}
