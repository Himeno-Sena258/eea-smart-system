import { Save, Settings } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SettingsPage() {
  const [academicYear, setAcademicYear] = useState("2025-2026")
  const [semester, setSemester] = useState("1")
  const [threshold, setThreshold] = useState("0.68")
  const [standardVersion, setStandardVersion] = useState("2024版工程教育认证标准")
  const [message, setMessage] = useState<string | null>(null)

  const handleSave = () => {
    setMessage("设置已在当前页面暂存")
  }

  return (
    <section className="grid gap-5">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <Settings size={16} />
          系统设置
        </p>
        <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
          认证参数设置
        </h1>
      </header>

      {message ? (
        <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          {message}
        </p>
      ) : null}

      <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">当前学年</span>
            <Input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">当前学期</span>
            <Input value={semester} onChange={(event) => setSemester(event.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">达成度阈值</span>
            <Input type="number" step="0.01" value={threshold} onChange={(event) => setThreshold(event.target.value)} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-bold text-slate-700">认证标准版本</span>
            <Input value={standardVersion} onChange={(event) => setStandardVersion(event.target.value)} />
          </label>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
          当前后端尚未提供系统设置保存接口，本页仅补齐前端配置入口和交互骨架。
        </div>

        <div className="flex justify-end">
          <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSave} type="button">
            <Save size={16} />
            暂存设置
          </Button>
        </div>
      </section>
    </section>
  )
}
