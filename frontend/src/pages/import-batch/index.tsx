import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react"
import { FileSpreadsheet, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores"

export function ImportPage() {
  const previewUserImport = useAuthStore((state) => state.previewUserImport)
  const submitUserImport = useAuthStore((state) => state.submitUserImport)
  const userImportPreview = useAuthStore((state) => state.userImportPreview)
  const userImportResult = useAuthStore((state) => state.userImportResult)
  const authLoading = useAuthStore((state) => state.loading)
  const authError = useAuthStore((state) => state.error)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    await previewUserImport(file)
    event.target.value = ""
  }

  const handleSubmit = async () => {
    if (!userImportPreview?.batchId) return
    await submitUserImport({ batchId: userImportPreview.batchId })
  }

  return (
    <section className="grid gap-5">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <FileSpreadsheet size={16} />
          批量导入
        </p>
        <h1 className="m-0 text-[34px] leading-tight font-extrabold text-slate-950">师生账号批量导入</h1>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-6">
          <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
            <Upload size={36} className="mx-auto text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">选择 Excel 文件进行批量导入</p>
            <p className="mt-1 text-xs text-slate-400">支持 .xlsx / .xls 格式</p>
            <input accept=".xlsx,.xls" className="sr-only" onChange={handleFileSelect} ref={fileInputRef} type="file" />
            <Button className="mt-4 bg-blue-700 text-white hover:bg-blue-800" disabled={authLoading} onClick={() => fileInputRef.current?.click()} type="button">
              <Upload size={16} />
              选择文件
            </Button>
            {selectedFile ? <p className="mt-3 text-sm font-bold text-slate-600">{selectedFile.name}</p> : null}
          </div>

          {authError ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{authError}</p>
          ) : null}

          {userImportPreview ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="m-0 text-xs font-bold text-slate-500">总行数</p>
                  <strong className="text-xl text-slate-950">{userImportPreview.totalRows}</strong>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="m-0 text-xs font-bold text-emerald-700">通过</p>
                  <strong className="text-xl text-emerald-800">{userImportPreview.validRows}</strong>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="m-0 text-xs font-bold text-amber-700">失败</p>
                  <strong className="text-xl text-amber-800">{userImportPreview.invalidRows}</strong>
                </div>
              </div>

              <div className="max-h-[360px] overflow-y-auto rounded-lg border border-slate-200">
                {userImportPreview.rows.slice(0, 20).map((row) => (
                  <div className="border-b border-slate-100 p-3 last:border-0" key={`${row.rowIndex}-${row.username}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="m-0 text-sm font-extrabold text-slate-900">{row.username} / {row.realName}</p>
                      <span className={row.validation === "PASS" ? "text-xs font-extrabold text-emerald-600" : "text-xs font-extrabold text-amber-600"}>{row.message}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{row.roleCodes.join("、")}{row.className ? ` / ${row.className}` : ""}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={authLoading || userImportPreview.invalidRows > 0} onClick={handleSubmit} type="button">
                  提交导入（{userImportPreview.validRows} 条）
                </Button>
              </div>
            </div>
          ) : null}

          {userImportResult ? (
            <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
              已导入 {userImportResult.successRows} 行，失败 {userImportResult.failedRows} 行
            </p>
          ) : null}
        </div>
      </section>
    </section>
  )
}
