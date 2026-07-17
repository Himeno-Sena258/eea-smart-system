import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">404</p>
        <h1>页面不存在</h1>
        <p className="auth-copy">请检查地址，或返回工作台继续操作。</p>
        <Link to="/dashboard">返回工作台</Link>
      </section>
    </main>
  )
}
