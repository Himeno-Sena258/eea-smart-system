import { Building2, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useBaseStore } from "@/stores"
import type { Organization, DictOption } from "@/models"
import { request } from "@/services/http"

function OrgNode({ node, level = 0, onRefresh }: { node: Organization; level?: number; onRefresh: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!window.confirm(`确认删除 ${node.name} 吗？`)) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await request({ url: `/organizations/${node.id}`, method: "DELETE" })
      onRefresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "删除失败"
      setDeleteError(msg)
    }
    setDeleting(false)
  }

  const typeLabel = node.type === "COLLEGE" ? "学院" : node.type === "MAJOR" ? "专业" : node.type === "CLASS" ? "班级" : node.type

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-red-50" style={{ paddingLeft: `${8 + level * 14}px` }}>
        <Building2 size={15} className="shrink-0 text-slate-400" />
        <span className="font-bold text-slate-700">{node.name}</span>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{typeLabel}</span>
        <button className="cursor-pointer rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30" disabled={deleting} onClick={handleDelete} title="删除">
          <Trash2 size={13} />
        </button>
      </div>
      {deleteError ? (
        <p className="m-0 px-2 pb-1 text-xs font-bold text-red-600" style={{ paddingLeft: `${8 + level * 14}px` }}>
          {deleteError}
        </p>
      ) : null}
      {node.children?.map((child) => <OrgNode key={child.id} node={child} level={level + 1} onRefresh={onRefresh} />)}
    </div>
  )
}

const orgTypeOptions: DictOption[] = [
  { label: "学院", value: "COLLEGE" },
  { label: "专业", value: "MAJOR" },
  { label: "班级", value: "CLASS" },
]

export function OrganizationPage() {
  const organizationTree = useBaseStore((state) => state.organizationTree)
  const fetchOrganizationTree = useBaseStore((state) => state.fetchOrganizationTree)

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState("MAJOR")
  const [newParentId, setNewParentId] = useState("")
  const [newGrade, setNewGrade] = useState("2024")
  const [saving, setSaving] = useState(false)
  const [treeCount, setTreeCount] = useState(0)

  const countNodes = (nodes: Organization[]): number => nodes.reduce((c, n) => c + 1 + countNodes(n.children ?? []), 0)

  useEffect(() => {
    void fetchOrganizationTree()
  }, [fetchOrganizationTree])

  useEffect(() => {
    setTreeCount(countNodes(organizationTree))
  }, [organizationTree])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const parentId = newParentId ? Number(newParentId) : null
      const payload: Record<string, unknown> = { name: newName.trim(), type: newType }
      if (parentId) payload.parentId = parentId
      if (newType === "CLASS" && newGrade) payload.grade = Number(newGrade)
      await request({ url: "/organizations", method: "POST", data: payload })
      setShowAddDialog(false)
      setNewName("")
      void fetchOrganizationTree()
    } catch { }
    setSaving(false)
  }

  const flattened: { id: number; name: string; type: string; depth: number }[] = []
  const flatten = (nodes: Organization[], depth = 0) => {
    nodes.forEach((n) => { flattened.push({ id: n.id as number, name: n.name, type: n.type, depth }); flatten(n.children ?? [], depth + 1) })
  }
  flatten(organizationTree)

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <Building2 size={16} />
            组织架构管理
          </p>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold text-slate-950">组织架构维护</h1>
        </div>
        <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={() => setShowAddDialog(true)} type="button">
          <Plus size={16} />
          新增组织
        </Button>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <strong className="text-base text-slate-950">组织树（共 {treeCount} 个节点）</strong>
        </div>
        <div className="grid max-h-[600px] gap-0.5 overflow-y-auto">
          {organizationTree.length > 0 ? (
            organizationTree.map((node) => <OrgNode key={node.id} node={node} onRefresh={() => void fetchOrganizationTree()} />)
          ) : (
            <p className="m-0 rounded-lg border border-dashed border-slate-200 p-4 text-sm font-bold text-slate-400">暂无组织数据</p>
          )}
        </div>
      </section>

      {showAddDialog ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={() => setShowAddDialog(false)}>
          <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="m-0 mb-4 text-lg font-extrabold text-slate-950">新增组织</h2>
            <div className="grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                组织名称
                <input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none transition focus:border-blue-600" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例: 软件工程系" />
              </label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                类型
                <select className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none" value={newType} onChange={(e) => setNewType(e.target.value)}>
                  {orgTypeOptions.map((o) => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                上级组织
                <select className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none" value={newParentId} onChange={(e) => setNewParentId(e.target.value)}>
                  <option value="">顶级（无上级）</option>
                  {flattened
                    .filter((n) => {
                      if (newType === "MAJOR") return n.type === "COLLEGE"
                      if (newType === "CLASS") return n.type === "MAJOR"
                      return false
                    })
                    .map((n) => <option key={n.id} value={n.id}>{'  '.repeat(n.depth)}{n.name}</option>)}
                </select>
              </label>
              {newType === "CLASS" ? (
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  年级
                  <input className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none" value={newGrade} onChange={(e) => setNewGrade(e.target.value)} placeholder="如 2024" />
                </label>
              ) : null}
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} type="button">取消</Button>
                <Button className="bg-blue-700 text-white hover:bg-blue-800" disabled={saving || !newName.trim()} onClick={handleAdd} type="button">{saving ? "保存中..." : "保存"}</Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
