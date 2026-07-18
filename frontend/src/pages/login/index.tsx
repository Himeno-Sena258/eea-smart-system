import { type FormEvent, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/stores"

const captchaChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

const createCaptcha = () =>
  Array.from({ length: 4 }, () => captchaChars[Math.floor(Math.random() * captchaChars.length)]).join("")

function CaptchaImage({ onRefresh, value }: { onRefresh: () => void; value: string }) {
  const lines = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => ({
        id: index,
        x1: 6 + index * 18,
        y1: Math.floor(Math.random() * 44) + 8,
        x2: 28 + index * 22,
        y2: Math.floor(Math.random() * 44) + 8,
      })),
    [value],
  )

  const dots = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        cx: Math.floor(Math.random() * 130) + 5,
        cy: Math.floor(Math.random() * 44) + 8,
      })),
    [value],
  )

  return (
    <button
      className="block h-14 w-[150px] rounded-lg border border-blue-200 bg-transparent p-0 max-sm:w-full"
      onClick={onRefresh}
      title="点击刷新验证码"
      type="button"
    >
      <svg className="h-full w-full" viewBox="0 0 150 56" role="img" aria-label="图形验证码">
        <rect width="150" height="56" rx="8" fill="#eff6ff" />
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            x2={line.x2}
            y1={line.y1}
            y2={line.y2}
            stroke="#93c5fd"
            strokeWidth="1.5"
          />
        ))}
        {dots.map((dot) => (
          <circle key={dot.id} cx={dot.cx} cy={dot.cy} r="1.4" fill="#60a5fa" opacity="0.7" />
        ))}
        {value.split("").map((char, index) => (
          <text
            key={`${char}-${index}`}
            x={24 + index * 28}
            y={36 + (index % 2) * 4}
            fill="#1d4ed8"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            fontSize="25"
            fontWeight="800"
            transform={`rotate(${index % 2 === 0 ? -9 : 7} ${24 + index * 28} 34)`}
          >
            {char}
          </text>
        ))}
      </svg>
    </button>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const loading = useAuthStore((state) => state.loading)
  const serviceError = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [captcha, setCaptcha] = useState(createCaptcha)
  const [captchaInput, setCaptchaInput] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha())
    setCaptchaInput("")
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearError()
    setFormError(null)

    if (!username.trim() || !password) {
      setFormError("请输入账号和密码")
      return
    }

    if (captchaInput.trim().toUpperCase() !== captcha) {
      setFormError("验证码不正确")
      refreshCaptcha()
      return
    }

    try {
      await login({ username: username.trim(), password })
      navigate("/dashboard", { replace: true })
    } catch {
      refreshCaptcha()
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="grid w-full max-w-[520px] gap-[18px] rounded-lg border border-slate-200 bg-white p-8">
        <div className="grid gap-2.5">
          <p className="m-0 text-[13px] font-extrabold text-teal-700">EEA Smart System</p>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">登录</h1>
          <p className="m-0 text-base leading-7 text-slate-600">使用管理员开通的账号进入工程教育认证工作台。</p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            <span>账号</span>
            <input
              autoComplete="username"
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_14%)]"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入账号"
              value={username}
            />
          </label>

          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            <span>密码</span>
            <input
              autoComplete="current-password"
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_14%)]"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
              type="password"
              value={password}
            />
          </label>

          <label className="grid gap-2 text-sm font-extrabold text-slate-700">
            <span>验证码</span>
            <div className="grid grid-cols-[minmax(120px,1fr)_150px] items-center gap-2.5 max-sm:grid-cols-1">
              <input
                autoComplete="off"
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:shadow-[0_0_0_3px_rgb(37_99_235_/_14%)]"
                maxLength={4}
                name="captcha"
                onChange={(event) => setCaptchaInput(event.target.value)}
                placeholder="输入验证码"
                value={captchaInput}
              />
              <CaptchaImage onRefresh={refreshCaptcha} value={captcha} />
            </div>
          </label>

          {formError || serviceError ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-700">
              {formError ?? serviceError}
            </p>
          ) : null}

          <button
            className="min-h-11 cursor-pointer rounded-lg border border-blue-700 bg-blue-700 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            type="submit"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="m-0 text-sm leading-6 text-slate-500">
          没有账号？请联系系统管理员开户，或查看
          <Link className="font-bold text-blue-700" to="/register">
            开户说明
          </Link>
          。
        </p>
      </section>
    </main>
  )
}
