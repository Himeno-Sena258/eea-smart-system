import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { Building2, FileSpreadsheet, KeyRound, Plus, Search, ShieldCheck, Trash2, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { roleLabels, roleOptions as staticRoleOptions } from "@/constants/role-options"
import type { CreateUserPayload, DictOption, ID, Organization, OrganizationType, RoleCode, UpdateUserPayload, User } from "@/models"
import { useAuthStore, useBaseStore, useSystemStore } from "@/stores"

const statusMetaMap = {
  0: { label: "禁用", className: "text-red-600" },
  1: { label: "正常", className: "text-emerald-600" },
} as const

const countOrganizations = (nodes: Organization[]): number =>
  nodes.reduce((count, node) => count + 1 + countOrganizations(node.children ?? []), 0)

const flattenOrganizations = (nodes: Organization[]): Organization[] =>
  nodes.flatMap((node) => [node, ...flattenOrganizations(node.children ?? [])])

const initialUserForm = {
  username: "",
  password: "",
  realName: "",
  email: "",
  phone: "",
  orgId: "",
  roleCodes: [] as string[],
  studentNo: "",
  classId: "",
}

type UserFormState = typeof initialUserForm

const toUserForm = (user: User): UserFormState => ({
  username: user.username,
  password: "",
  realName: user.realName,
  email: user.email ?? "",
  phone: user.phone ?? "",
  orgId: user.orgId ? String(user.orgId) : "",
  roleCodes: user.roleCodes?.map(String) ?? [],
  studentNo: user.studentNo ?? "",
  classId: user.classId ? String(user.classId) : "",
})

const toOptionalId = (value: string): ID | undefined => {
  if (!value) return undefined
  return Number(value)
}

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
  const createUser = useAuthStore((state) => state.createUser)
  const updateUser = useAuthStore((state) => state.updateUser)
  const updateUserStatus = useAuthStore((state) => state.updateUserStatus)
  const resetUserPassword = useAuthStore((state) => state.resetUserPassword)
  const deleteUser = useAuthStore((state) => state.deleteUser)
  const previewUserImport = useAuthStore((state) => state.previewUserImport)
  const submitUserImport = useAuthStore((state) => state.submitUserImport)
  const userImportPreview = useAuthStore((state) => state.userImportPreview)
  const userImportResult = useAuthStore((state) => state.userImportResult)
  const authLoading = useAuthStore((state) => state.loading)
  const authError = useAuthStore((state) => state.error)
  const organizationTree = useBaseStore((state) => state.organizationTree)
  const classesPage = useBaseStore((state) => state.classesPage)
  const fetchOrganizationTree = useBaseStore((state) => state.fetchOrganizationTree)
  const fetchClasses = useBaseStore((state) => state.fetchClasses)
  const auditLogsPage = useSystemStore((state) => state.auditLogsPage)
  const fetchAuditLogs = useSystemStore((state) => state.fetchAuditLogs)
  const roleOptions = useSystemStore((state) => state.roleOptions)
  const organizationTypeOptions = useSystemStore((state) => state.organizationTypeOptions)

  const users = usersPage?.records ?? []
  const auditLogs = auditLogsPage?.records ?? []
  const activeUsers = usersPage?.activeCount ?? usersPage?.total ?? 0
  const organizationCount = countOrganizations(organizationTree)
  const availableRoleOptions = roleOptions.length > 0
    ? roleOptions
    : staticRoleOptions.map((option) => ({ label: option.label, value: option.role }))
  const organizationOptions = useMemo(() => flattenOrganizations(organizationTree), [organizationTree])
  const classOptions = classesPage?.records ?? []
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFileName, setSelectedFileName] = useState("")
  const [keyword, setKeyword] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [pageNum, setPageNum] = useState(1)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState<UserFormState>(initialUserForm)
  const [resetDialogUser, setResetDialogUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    void fetchUsers({
      pageNum: pageNum,
      pageSize: 20,
      keyword: keyword.trim() || undefined,
      roleCode: roleFilter === "ALL" ? undefined : roleFilter,
    })
    void fetchOrganizationTree()
    void fetchClasses({ pageNum: 1, pageSize: 100 })
    void fetchAuditLogs({ pageNum: 1, pageSize: 10 })
  }, [fetchAuditLogs, fetchClasses, fetchOrganizationTree, fetchUsers, keyword, roleFilter, pageNum])

  const refreshPageData = async () => {
    await fetchUsers({
      pageNum: pageNum,
      pageSize: 20,
      keyword: keyword.trim() || undefined,
      roleCode: roleFilter === "ALL" ? undefined : roleFilter,
    })
    await fetchOrganizationTree()
    await fetchAuditLogs({ pageNum: 1, pageSize: 10 })
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    setUserForm(initialUserForm)
    setUserDialogOpen(true)
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setUserForm(toUserForm(user))
    setUserDialogOpen(true)
  }

  const updateUserFormField = (field: keyof UserFormState, value: string) => {
    setUserForm((current) => ({ ...current, [field]: value }))
  }

  const toggleRoleCode = (roleCode: string) => {
    setUserForm((current) => ({
      ...current,
      roleCodes: current.roleCodes.includes(roleCode)
        ? current.roleCodes.filter((item) => item !== roleCode)
        : [...current.roleCodes, roleCode],
    }))
  }

  const handleSubmitUserForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      realName: userForm.realName.trim(),
      email: userForm.email.trim() || undefined,
      phone: userForm.phone.trim() || undefined,
      orgId: toOptionalId(userForm.orgId),
      roleCodes: userForm.roleCodes,
      studentNo: userForm.studentNo.trim() || undefined,
      classId: toOptionalId(userForm.classId),
    }

    if (editingUser) {
      await updateUser(editingUser.id, payload satisfies UpdateUserPayload)
    } else {
      await createUser({
        ...payload,
        username: userForm.username.trim(),
        password: userForm.password || undefined,
      } satisfies CreateUserPayload)
    }

    setUserDialogOpen(false)
    await refreshPageData()
  }

  const handleToggleStatus = async (user: User) => {
    await updateUserStatus(user.id, { status: user.status === 0 ? 1 : 0 })
    await refreshPageData()
  }

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`确认删除账号 ${user.username} 吗？`)) return

    await deleteUser(user.id)
    await refreshPageData()
  }

  const handleResetPassword = async () => {
    if (!resetDialogUser) return

    await resetUserPassword(resetDialogUser.id, { newPassword: newPassword.trim() || undefined })
    setResetDialogUser(null)
    setNewPassword("")
    await fetchAuditLogs({ pageNum: 1, pageSize: 10 })
  }

  const handleUserImportPreview = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFileName(file.name)
    await previewUserImport(file)
    event.target.value = ""
  }

  const handleSubmitUserImport = async () => {
    if (!userImportPreview?.batchId) return

    await submitUserImport({ batchId: userImportPreview.batchId })
    await refreshPageData()
  }

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
          </div>
        </div>
        <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={openCreateDialog} type="button">
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
              <input
                accept=".xlsx,.xls"
                className="sr-only"
                onChange={handleUserImportPreview}
                ref={fileInputRef}
                type="file"
              />
              <Button
                className="w-full bg-blue-700 text-white hover:bg-blue-800"
                disabled={authLoading}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                选择 Excel 预览
              </Button>
              {userImportPreview ? (
                <Button
                  className="w-full"
                  disabled={authLoading || userImportPreview.invalidRows > 0}
                  onClick={handleSubmitUserImport}
                  type="button"
                  variant="outline"
                >
                  提交导入
                </Button>
              ) : null}
            </div>
            {selectedFileName ? <p className="mt-2 mb-0 text-xs font-bold text-slate-500">{selectedFileName}</p> : null}
            {authError ? (
              <p className="mt-2 mb-0 rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-bold text-red-700">
                {authError}
              </p>
            ) : null}
            {userImportPreview ? (
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2">
                  <p className="m-0 text-[11px] font-bold text-slate-500">总行数</p>
                  <strong className="text-base text-slate-950">{userImportPreview.totalRows}</strong>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2">
                  <p className="m-0 text-[11px] font-bold text-emerald-700">通过</p>
                  <strong className="text-base text-emerald-800">{userImportPreview.validRows}</strong>
                </div>
                <div className="rounded-lg bg-amber-50 p-2">
                  <p className="m-0 text-[11px] font-bold text-amber-700">失败</p>
                  <strong className="text-base text-amber-800">{userImportPreview.invalidRows}</strong>
                </div>
              </div>
            ) : null}
            {userImportResult ? (
              <p className="mt-2 mb-0 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs font-bold text-emerald-700">
                已导入 {userImportResult.successRows} 行，失败 {userImportResult.failedRows} 行
              </p>
            ) : null}
            <div className="mt-3 grid gap-2">
              {userImportPreview?.rows.slice(0, 6).map((row) => (
                <div className="rounded-lg border border-slate-200 p-3" key={`${row.rowIndex}-${row.username}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="m-0 text-sm font-extrabold text-slate-900">{row.username} / {row.realName}</p>
                    <span className={row.validation === "PASS" ? "text-xs font-extrabold text-emerald-600" : "text-xs font-extrabold text-amber-600"}>
                      {row.message}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {row.roleCodes.join("、")} / {row.organizationName ?? row.className ?? "未匹配组织"}
                  </p>
                </div>
              ))}
              {!userImportPreview ? (
                <p className="m-0 rounded-lg border border-dashed border-slate-200 p-3 text-sm font-bold text-slate-400">
                  选择 Excel 后显示校验结果
                </p>
              ) : null}
            </div>
          </section>
        </aside>

        <div className="grid gap-5">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center">
              <label className="relative block lg:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  className="h-10 bg-white pl-9"
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="搜索工号/姓名"
                  value={keyword}
                />
              </label>
              <Select onValueChange={setRoleFilter} value={roleFilter}>
                <SelectTrigger className="h-10 w-40 bg-white">
                  <SelectValue placeholder="所有角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有角色</SelectItem>
                  {availableRoleOptions.map((option) => (
                    <SelectItem key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        <td className="p-4"><RoleBadge roleOptions={availableRoleOptions} user={user} /></td>
                        <td className="p-4 text-slate-600">{user.orgName}</td>
                        <td className={`p-4 font-extrabold ${status.className}`}>{status.label}</td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2">
                            <Button onClick={() => openEditDialog(user)} variant="outline" type="button">编辑</Button>
                            <Button onClick={() => handleToggleStatus(user)} variant="outline" type="button">
                              {user.status === 0 ? "启用" : "禁用"}
                            </Button>
                            <Button onClick={() => setResetDialogUser(user)} variant="outline" type="button">
                              <KeyRound size={15} />
                              重置密码
                            </Button>
                            <Button onClick={() => handleDeleteUser(user)} variant="outline" type="button">
                              <Trash2 size={15} />
                              删除
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
              {usersPage && usersPage.pages > 1 ? (
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                  <p className="m-0 text-sm text-slate-500">
                    共 {usersPage.total} 条，第 {usersPage.pageNum}/{usersPage.pages} 页
                  </p>
                  <div className="flex gap-2">
                    <Button
                      disabled={usersPage.pageNum <= 1}
                      onClick={() => setPageNum((prev) => Math.max(1, prev - 1))}
                      variant="outline"
                      type="button"
                    >
                      <ChevronLeft size={16} />
                      上一页
                    </Button>
                    <Button
                      disabled={usersPage.pageNum >= usersPage.pages}
                      onClick={() => setPageNum((prev) => prev + 1)}
                      variant="outline"
                      type="button"
                    >
                      下一页
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
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

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-h-[calc(100vh-80px)] !max-w-[680px] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{editingUser ? "编辑账号" : "新增账号"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "修改用户基础信息和角色分配。" : "通过管理员开户接口创建用户。"}
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4" onSubmit={handleSubmitUserForm}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Label className="grid gap-2">
                <span>登录账号</span>
                <Input
                  disabled={Boolean(editingUser)}
                  onChange={(event) => updateUserFormField("username", event.target.value)}
                  required={!editingUser}
                  value={userForm.username}
                />
              </Label>
              <Label className="grid gap-2">
                <span>初始密码</span>
                <Input
                  disabled={Boolean(editingUser)}
                  onChange={(event) => updateUserFormField("password", event.target.value)}
                  placeholder={editingUser ? "编辑时不修改密码" : "不填则由后端使用默认值"}
                  type="password"
                  value={userForm.password}
                />
              </Label>
              <Label className="grid gap-2">
                <span>真实姓名</span>
                <Input
                  onChange={(event) => updateUserFormField("realName", event.target.value)}
                  required
                  value={userForm.realName}
                />
              </Label>
              <Label className="grid gap-2">
                <span>手机号</span>
                <Input
                  onChange={(event) => updateUserFormField("phone", event.target.value)}
                  value={userForm.phone}
                />
              </Label>
              <Label className="grid gap-2">
                <span>邮箱</span>
                <Input
                  onChange={(event) => updateUserFormField("email", event.target.value)}
                  type="email"
                  value={userForm.email}
                />
              </Label>
              <div className="grid gap-2">
                <Label>所属组织</Label>
                <Select
                  onValueChange={(value) => updateUserFormField("orgId", value === "NONE" ? "" : value)}
                  value={userForm.orgId || "NONE"}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="选择组织" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">不选择</SelectItem>
                    {organizationOptions.map((organization) => (
                      <SelectItem key={organization.id} value={String(organization.id)}>
                        {organization.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Label className="grid gap-2">
                <span>学生学号</span>
                <Input
                  onChange={(event) => updateUserFormField("studentNo", event.target.value)}
                  placeholder="学生角色必填"
                  value={userForm.studentNo}
                />
              </Label>
              <div className="grid gap-2">
                <Label>行政班</Label>
                <Select
                  onValueChange={(value) => updateUserFormField("classId", value === "NONE" ? "" : value)}
                  value={userForm.classId || "NONE"}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="选择行政班" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">不选择</SelectItem>
                    {classOptions.map((classInfo) => (
                      <SelectItem key={classInfo.id} value={String(classInfo.id)}>
                        {classInfo.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>分配角色</Label>
              <div className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
                {availableRoleOptions.map((option) => (
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700" key={String(option.value)}>
                    <input
                      checked={userForm.roleCodes.includes(String(option.value))}
                      className="size-4 accent-blue-700"
                      onChange={() => toggleRoleCode(String(option.value))}
                      type="checkbox"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {authError ? (
              <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {authError}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                disabled={authLoading || userForm.roleCodes.length === 0}
                type="submit"
              >
                {authLoading ? "提交中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(resetDialogUser)} onOpenChange={(open) => !open && setResetDialogUser(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              {resetDialogUser ? `账号 ${resetDialogUser.username} 将被重置密码。` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="new-password">新密码</Label>
            <Input
              id="new-password"
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="不填则由后端使用默认值"
              type="password"
              value={newPassword}
            />
          </div>
          {authError ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {authError}
            </p>
          ) : null}
          <DialogFooter>
            <Button disabled={authLoading} onClick={handleResetPassword} type="button">
              {authLoading ? "提交中..." : "确认重置"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
