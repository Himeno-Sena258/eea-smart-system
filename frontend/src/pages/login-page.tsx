import { Link } from "react-router-dom"

export function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">EEA Smart System</p>
        <h1>登录</h1>
        <p className="auth-copy">账号由系统管理员统一开户。这里后续接入登录表单和角色跳转。</p>
        <div className="placeholder-form">
          <input placeholder="账号" disabled />
          <input placeholder="密码" type="password" disabled />
          <button disabled>登录占位</button>
        </div>
        <Link to="/dashboard">进入工作台占位</Link>
      </section>
    </main>
  )
}
