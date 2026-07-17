import { Link } from "react-router-dom"

export function RegisterPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">账号注册</p>
        <h1>注册已关闭</h1>
        <p className="auth-copy">系统不开放普通用户自主注册。师生账号、角色和组织归属由系统管理员统一开户或批量导入。</p>
        <Link to="/login">返回登录</Link>
      </section>
    </main>
  )
}
