import {
  Building2,
  CheckCircle2,
  IdCard,
  LockKeyhole,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserCircle,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { roleLabels } from "@/constants/role-options"
import type { RoleCode } from "@/models"
import { useAuthStore, useUiStore } from "@/stores"

function Field({
  icon: Icon,
  label,
  value,
  type = "text",
}: {
  icon: typeof UserCircle
  label: string
  value: string
  type?: string
}) {
  return (
    <label className="grid gap-1.5">
      <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
        <Icon size={16} className="text-slate-400" aria-hidden="true" />
        {label}
      </span>
      <Input className="h-10 bg-white text-sm" type={type} value={value || "-"} readOnly />
    </label>
  )
}

const getPrimaryRole = (roles: Array<RoleCode | string> | undefined, activeRole: RoleCode) =>
  roles?.find((role): role is RoleCode => role in roleLabels) ?? activeRole

const getInitials = (name?: string, username?: string) => {
  const source = name || username || "用户"
  if (/^[A-Za-z0-9]+$/.test(source)) return source.slice(0, 2).toUpperCase()
  return source.slice(0, 2)
}

export function ProfilePage() {
  const navigate = useNavigate()
  const activeRole = useUiStore((state) => state.activeRole)
  const currentUser = useAuthStore((state) => state.currentUser)
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser)
  const changePassword = useAuthStore((state) => state.changePassword)
  const logout = useAuthStore((state) => state.logout)
  const loading = useAuthStore((state) => state.loading)
  const storeError = useAuthStore((state) => state.error)

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const primaryRole = getPrimaryRole(currentUser?.roleCodes, activeRole)
  const roleNames = useMemo(() => {
    if (currentUser?.roleNames?.length) return currentUser.roleNames.join(" / ")
    if (currentUser?.roleCodes?.length) {
      return currentUser.roleCodes.map((role) => roleLabels[role as RoleCode] ?? role).join(" / ")
    }
    return roleLabels[activeRole]
  }, [activeRole, currentUser?.roleCodes, currentUser?.roleNames])

  useEffect(() => {
    setLocalError(null)
    void fetchCurrentUser().catch((requestError: Error) => setLocalError(requestError.message))
  }, [fetchCurrentUser])

  const resetPasswordForm = () => {
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleChangePassword = async () => {
    setMessage(null)
    setLocalError(null)

    if (!oldPassword || !newPassword || !confirmPassword) {
      setLocalError("请完整填写旧密码、新密码和确认新密码。")
      return
    }
    if (newPassword !== confirmPassword) {
      setLocalError("两次输入的新密码不一致。")
      return
    }

    try {
      const result = await changePassword({ oldPassword, newPassword, confirmPassword })
      resetPasswordForm()
      setPasswordDialogOpen(false)
      setMessage(result)
    } catch (requestError) {
      setLocalError(requestError instanceof Error ? requestError.message : "修改密码失败")
    }
  }

  const handleLogout = async () => {
    setMessage(null)
    setLocalError(null)
    try {
      await logout()
      setLogoutDialogOpen(false)
      navigate("/login", { replace: true })
    } catch (requestError) {
      setLocalError(requestError instanceof Error ? requestError.message : "退出登录失败")
    }
  }

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-2">
          <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
            <UserCircle size={16} />
            个人中心
          </p>
          <div>
            <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
              账号资料与安全
            </h1>
          </div>
        </div>
        <Button disabled={loading} onClick={() => void fetchCurrentUser()} variant="outline" type="button">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          刷新资料
        </Button>
      </header>

      {localError || storeError ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {localError ?? storeError}
        </p>
      ) : null}
      {message ? (
        <p className="m-0 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          {message}
        </p>
      ) : null}

      <div className="grid items-stretch gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex h-full min-h-[420px] flex-col rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto grid size-18 place-items-center rounded-full bg-blue-700 text-xl font-extrabold text-white shadow-sm">
            {getInitials(currentUser?.realName, currentUser?.username)}
          </div>
          <h2 className="mt-3 text-lg font-extrabold text-slate-950">{currentUser?.realName ?? "-"}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{roleLabels[primaryRole] ?? primaryRole}</p>

          <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 text-left text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 text-emerald-600" size={17} aria-hidden="true" />
              <div>
                <p className="font-extrabold text-slate-800">账号状态</p>
                <p className="mt-0.5 text-slate-500">{currentUser?.status === 0 ? "已停用" : "正常启用"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 text-slate-400" size={17} aria-hidden="true" />
              <div>
                <p className="font-extrabold text-slate-800">所属机构</p>
                <p className="mt-0.5 text-slate-500">{currentUser?.orgName ?? currentUser?.className ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-5 text-left text-xs leading-5 text-slate-400">
            当前角色：{roleNames}
          </div>
        </aside>

        <div className="grid gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="m-0 text-lg font-extrabold text-slate-950">基础信息</h2>
                <p className="mt-1 text-sm text-slate-500">当前账号资料来自后端用户信息接口。</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                {roleNames}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={IdCard} label="账号" value={currentUser?.username ?? ""} />
              <Field icon={UserCircle} label="姓名" value={currentUser?.realName ?? ""} />
              <Field icon={Mail} label="电子邮箱" value={currentUser?.email ?? ""} type="email" />
              <Field icon={Phone} label="联系电话" value={currentUser?.phone ?? ""} />
              <div className="md:col-span-2">
                <Field icon={Building2} label="所属机构" value={currentUser?.orgName ?? currentUser?.className ?? ""} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="m-0 flex items-center gap-2 text-lg font-extrabold text-slate-950">
              <ShieldCheck size={19} className="text-blue-700" />
              账号安全
            </h2>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <article className="flex items-center justify-between gap-4 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-blue-700 text-white">
                    <LockKeyhole size={17} />
                  </span>
                  <strong className="text-sm font-extrabold text-slate-950">修改密码</strong>
                </div>
                <Button
                  className="bg-blue-700 text-white hover:bg-blue-800"
                  disabled={loading}
                  onClick={() => {
                    setLocalError(null)
                    setMessage(null)
                    setPasswordDialogOpen(true)
                  }}
                  type="button"
                >
                  修改
                </Button>
              </article>

              <article className="flex items-center justify-between gap-4 rounded-lg border border-red-100 bg-red-50/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-red-600 text-white">
                    <LogOut size={17} />
                  </span>
                  <strong className="text-sm font-extrabold text-slate-950">退出登录</strong>
                </div>
                <Button disabled={loading} onClick={() => setLogoutDialogOpen(true)} variant="outline" type="button">
                  退出
                </Button>
              </article>
            </div>
          </section>
        </div>
      </div>

      <Dialog
        open={passwordDialogOpen}
        onOpenChange={(open) => {
          setPasswordDialogOpen(open)
          if (!open) resetPasswordForm()
        }}
      >
        <DialogContent className="bg-white shadow-2xl sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-950">修改密码</DialogTitle>
            <DialogDescription>请输入旧密码并确认新密码。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">旧密码</span>
              <Input
                autoComplete="current-password"
                onChange={(event) => setOldPassword(event.target.value)}
                type="password"
                value={oldPassword}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">新密码</span>
              <Input
                autoComplete="new-password"
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                value={newPassword}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-bold text-slate-700">确认新密码</span>
              <Input
                autoComplete="new-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                value={confirmPassword}
              />
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={loading} variant="outline" type="button">取消</Button>
            </DialogClose>
            <Button
              className="bg-blue-700 text-white hover:bg-blue-800"
              disabled={loading}
              onClick={handleChangePassword}
              type="button"
            >
              <LockKeyhole size={16} />
              确认修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="border-red-100 bg-white shadow-2xl sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-red-700">确认退出登录</DialogTitle>
            <DialogDescription>退出后需要重新输入账号和密码才能访问系统。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={loading} variant="outline" type="button">取消</Button>
            </DialogClose>
            <Button disabled={loading} onClick={handleLogout} variant="destructive" type="button">
              <LogOut size={16} />
              确认退出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
