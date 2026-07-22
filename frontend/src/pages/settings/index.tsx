import { useEffect, useState } from "react"
import { Loader2, Save, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { request } from "@/services/http"

export function SettingsPage() {
  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("")
  const [threshold, setThreshold] = useState("")
  const [standardVersion, setStandardVersion] = useState("")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    request<Record<string, unknown>>({ url: "/settings", method: "GET" })
      .then((res) => {
        const d = res.data
        setAcademicYear(String(d.academicYear ?? "2025-2026"))
        setSemester(String(d.semester ?? "1"))
        setThreshold(String(d.attainmentThreshold ?? "0.68"))
        setStandardVersion(String(d.certificationStandard ?? "2024版工程教育认证标准"))
      })
      .catch(() => {
        setAcademicYear("2025-2026")
        setSemester("1")
        setThreshold("0.68")
        setStandardVersion("2024版工程教育认证标准")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setMessage(null)
    setError(null)
    try {
      await request<string>({
        url: "/settings",
        method: "PUT",
        data: {
          academicYear,
          semester: Number(semester),
          attainmentThreshold: Number(threshold),
          certificationStandard: standardVersion,
        },
      })
      setMessage("系统设置保存成功")
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败")
    }
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
      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm font-bold text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            加载系统设置...
          </div>
        ) : (
        <>
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

        <div className="flex justify-end">
          <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSave} type="button">
            <Save size={16} />
            保存设置
          </Button>
        </div>
        </>)}
      </section>
    </section>
  )
}
