import { useEffect } from "react"
import { Building2, FileSpreadsheet, KeyRound, Plus, Search, ShieldCheck, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { roleLabels } from "@/constants/role-options"
import type { DictOption, Organization, OrganizationType, User } from "@/models"
import { useAuthStore, useBaseStore, useSystemStore } from "@/stores"
import { importPreviewRowsMock } from "./mock/users-mock"

const statusMetaMap = {
  0: { label: "禁用", className: "text-red-600" },
  1: { label: "正常", className: "text-emerald-600" },
} as const

const countOrganizations = (nodes: Organization[]): number =>
  nodes.reduce((count, node) => count + 1 + countOrganizations(node.children ?? []), 0)

function OrganizationNode({
  node,
  level = 0,
  typeOptions,
}: {
  node: Organization
  level?: number
  typeOptions: DictOption<OrganizationType>[]
}) {
  const typeLabel = typeOptions.find((option) => option.value === node.type)?.label ?? node.type

  return (
    <div>
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-700" style={{ paddingLeft: `${8 + level * 14}px` }}>
        <Building2 size={15} className="text-slate-400" />
        <span>{node.name}</span>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{typeLabel}</span>
      </div>
      {node.children?.map((child) => <OrganizationNode key={child.id} node={child} level={level + 1} typeOptions={typeOptions} />)}
    </div>
  )
}

function RoleBadge({ roleOptions, user }: { roleOptions: DictOption<string>[]; user: User }) {
  const roleCode = user.roleCodes?.[0]
  const label = roleOptions.find((option) => option.value === roleCode)?.label
    ?? (roleCode && roleCode in roleLabels ? roleLabels[roleCode as keyof typeof roleLabels] : roleCode)

  return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-extrabold text-blue-700">{label}</span>
}

export function UsersPage() {
  const usersPage = useAuthStore((state) => state.usersPage)
  const fetchUsers = useAuthStore((state) => state.fetchUsers)
  const organizationTree = useBaseStore((state) => state.organizationTree)
  const fetchOrganizationTree = useBaseStore((state) => state.fetchOrganizationTree)
  const auditLogsPage = useSystemStore((state) => state.auditLogsPage)
  const fetchAuditLogs = useSystemStore((state) => state.fetchAuditLogs)
  const roleOptions = useSystemStore((state) => state.roleOptions)
  const organizationTypeOptions = useSystemStore((state) => state.organizationTypeOptions)

  const users = usersPage?.records ?? []
  const auditLogs = auditLogsPage?.records ?? []
  const activeUsers = users.filter((user) => user.status === 1).length
  const organizationCount = countOrganizations(organizationTree)

  useEffect(() => {
    void fetchUsers({ pageNum: 1, pageSize: 20 })
    void fetchOrganizationTree()
    void fetchAuditLogs({ pageNum: 1, pageSize: 10 })
  }, [fetchAuditLogs, fetchOrganizationTree, fetchUsers])

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <UserCog size={16} />
            用户与组织管理
          </p>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              系统用户与组织架构管理
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              管理员专属页面，操作用户开户、权限分配与组织树维护。
            </p>
          </div>
        </div>
        <Button className="bg-blue-700 text-white hover:bg-blue-800" type="button">
          <Plus size={16} />
          新增账号
        </Button>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        <article className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="m-0 text-sm font-bold text-blue-700">启用账号</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-blue-800">{activeUsers}</strong>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="m-0 text-sm font-bold text-slate-500">全部账号</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-slate-950">{usersPage?.total ?? users.length}</strong>
        </article>
        <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="m-0 text-sm font-bold text-emerald-700">组织节点</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-emerald-800">{organizationCount}</strong>
        </article>
        <article className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="m-0 text-sm font-bold text-amber-700">审计记录</p>
          <strong className="mt-2 block text-2xl leading-none font-extrabold text-amber-800">{auditLogsPage?.total ?? auditLogs.length}</strong>
        </article>
      </section>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="grid content-start gap-5">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <Building2 size={19} className="text-blue-700" />
              组织架构
            </h2>
            <div className="mt-3 grid max-h-[360px] gap-1 overflow-y-auto pr-1">
              {organizationTree.length > 0 ? (
                organizationTree.map((node) => <OrganizationNode key={node.id} node={node} typeOptions={organizationTypeOptions} />)
              ) : (
                <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
                  暂无组织数据
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <FileSpreadsheet size={19} className="text-blue-700" />
              批量导入预览
            </h2>
            <div className="mt-3 grid gap-2">
              {importPreviewRowsMock.map((row) => (
                <div className="rounded-lg border border-slate-200 p-3" key={row.account}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="m-0 text-sm font-extrabold text-slate-900">{row.account} / {row.realName}</p>
                    <span className={row.validation === "PASS" ? "text-xs font-extrabold text-emerald-600" : "text-xs font-extrabold text-amber-600"}>
                      {row.message}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{row.roleCode} / {row.organization}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <div className="grid gap-5">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center">
              <label className="relative block lg:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
                <Input className="h-10 bg-white pl-9" placeholder="搜索工号/姓名" readOnly />
              </label>
              <Button variant="outline" type="button">所有角色</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="border-b border-slate-200 p-4">工号/学号</th>
                    <th className="border-b border-slate-200 p-4">姓名</th>
                    <th className="border-b border-slate-200 p-4">角色</th>
                    <th className="border-b border-slate-200 p-4">所属组织</th>
                    <th className="border-b border-slate-200 p-4">状态</th>
                    <th className="border-b border-slate-200 p-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const status = statusMetaMap[user.status ?? 1]

                    return (
                      <tr className="border-b border-slate-100" key={user.id}>
                        <td className="p-4 font-mono text-slate-700">{user.username}</td>
                        <td className="p-4 font-extrabold text-slate-950">{user.realName}</td>
                        <td className="p-4"><RoleBadge roleOptions={roleOptions} user={user} /></td>
                        <td className="p-4 text-slate-600">{user.orgName}</td>
                        <td className={`p-4 font-extrabold ${status.className}`}>{status.label}</td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2">
                            <Button variant="outline" type="button">编辑</Button>
                            <Button variant="outline" type="button">
                              <KeyRound size={15} />
                              重置密码
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {users.length === 0 ? (
                <p className="m-0 border-t border-slate-100 p-6 text-center text-sm font-bold text-slate-400">
                  暂无用户数据
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <ShieldCheck size={19} className="text-blue-700" />
              安全审计
            </h2>
            <div className="mt-3 max-h-[260px] overflow-y-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="sticky top-0 bg-white text-slate-500">
                  <tr>
                    <th className="border-b border-slate-200 py-2">时间</th>
                    <th className="border-b border-slate-200 py-2">账号</th>
                    <th className="border-b border-slate-200 py-2">操作</th>
                    <th className="border-b border-slate-200 py-2">对象</th>
                    <th className="border-b border-slate-200 py-2">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr className="border-b border-slate-100" key={log.id}>
                      <td className="py-3 text-slate-600">{log.createdAt}</td>
                      <td className="py-3 font-bold text-slate-900">{log.username}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-extrabold text-blue-700">{log.action}</span>
                      </td>
                      <td className="py-3 text-slate-600">{log.target}</td>
                      <td className="py-3 font-mono text-slate-500">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length === 0 ? (
                <p className="m-0 p-6 text-center text-sm font-bold text-slate-400">暂无审计日志</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}
