import { Link } from "react-router-dom"

export function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="grid w-full max-w-[460px] gap-4 rounded-lg border border-slate-200 bg-white p-8">
        <p className="m-0 text-[13px] font-extrabold text-teal-700">账号注册</p>
        <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">注册已关闭</h1>
        <p className="m-0 text-base leading-7 text-slate-600">
          系统不开放普通用户自主注册。师生账号、角色和组织归属由系统管理员统一开户或批量导入。
        </p>
        <Link className="font-bold text-blue-700" to="/login">
          返回登录
        </Link>
      </section>
    </main>
  )
}
