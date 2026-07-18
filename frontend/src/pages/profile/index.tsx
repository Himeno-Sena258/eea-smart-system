import {
  Building2,
  CheckCircle2,
  IdCard,
  LockKeyhole,
  LogOut,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { roleLabels } from "@/constants/role-options"
import type { RoleCode } from "@/models"
import { useAuthStore, useUiStore } from "@/stores"

interface ProfileMock {
  name: string
  username: string
  email: string
  phone: string
  organization: string
  identity: string
  avatar: string
}

const profileMockMap: Record<RoleCode, ProfileMock> = {
  ADMIN: {
    name: "系统管理员",
    username: "admin",
    email: "admin@example.edu.cn",
    phone: "13800138000",
    organization: "教务与认证管理中心",
    identity: "系统运维",
    avatar: "AD",
  },
  DIRECTOR: {
    name: "李主任",
    username: "director01",
    email: "director@example.edu.cn",
    phone: "13800138001",
    organization: "计算机学院 / 软件工程专业",
    identity: "专业负责人",
    avatar: "DIR",
  },
  COORDINATOR: {
    name: "王教授",
    username: "coordinator01",
    email: "coordinator@example.edu.cn",
    phone: "13800138002",
    organization: "计算机学院 / 软件工程专业",
    identity: "课程负责人",
    avatar: "CO",
  },
  INSTRUCTOR: {
    name: "张老师",
    username: "teacher01",
    email: "teacher@example.edu.cn",
    phone: "13800138003",
    organization: "计算机学院 / 软件工程专业",
    identity: "授课教师",
    avatar: "INS",
  },
  STUDENT: {
    name: "刘同学",
    username: "20240001",
    email: "student@example.edu.cn",
    phone: "13800138004",
    organization: "软件工程 2024 级 1 班",
    identity: "学生",
    avatar: "STU",
  },
}

const securityItems = [
  { title: "登录密码", description: "建议定期更新密码，避免与其他系统复用。", icon: LockKeyhole, action: "修改密码" },
  { title: "账号状态", description: "当前账号启用中，可正常访问已授权功能。", icon: CheckCircle2, action: "查看状态" },
  { title: "退出登录", description: "结束当前会话并返回登录页面。", icon: LogOut, action: "退出" },
]

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
      <Input className="h-10 bg-white text-sm" type={type} value={value} readOnly />
    </label>
  )
}

export function ProfilePage() {
  const activeRole = useUiStore((state) => state.activeRole)
  const currentUser = useAuthStore((state) => state.currentUser)
  const profile = useMemo(() => {
    const mock = profileMockMap[activeRole]

    return {
      ...mock,
      name: currentUser?.realName ?? mock.name,
      username: currentUser?.username ?? mock.username,
      email: currentUser?.email ?? mock.email,
      phone: currentUser?.phone ?? mock.phone,
      organization: currentUser?.orgName ?? currentUser?.className ?? mock.organization,
    }
  }, [activeRole, currentUser])

  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <p className="m-0 inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
          <UserCircle size={16} />
          个人中心
        </p>
        <div>
          <h1 className="m-0 text-[34px] leading-tight font-extrabold tracking-normal text-slate-950">
            管理个人资料与账号安全
          </h1>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto grid size-18 place-items-center rounded-full bg-blue-700 text-xl font-extrabold text-white shadow-sm">
            {profile.avatar}
          </div>
          <h2 className="mt-3 text-lg font-extrabold text-slate-950">{profile.name}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{profile.identity}</p>

          <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-left text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 text-emerald-600" size={17} aria-hidden="true" />
              <div>
                <p className="font-extrabold text-slate-800">账号状态</p>
                <p className="mt-0.5 text-slate-500">正常启用</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 text-slate-400" size={17} aria-hidden="true" />
              <div>
                <p className="font-extrabold text-slate-800">所属机构</p>
                <p className="mt-0.5 text-slate-500">{profile.organization}</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="grid gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="m-0 text-lg font-extrabold text-slate-950">基础信息设置</h2>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                {roleLabels[activeRole]}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={IdCard} label="账号" value={profile.username} />
              <Field icon={UserCircle} label="姓名" value={profile.name} />
              <Field icon={Mail} label="电子邮箱" value={profile.email} type="email" />
              <Field icon={Phone} label="联系电话" value={profile.phone} />
              <div className="md:col-span-2">
                <Field icon={Building2} label="所属机构" value={profile.organization} />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button className="bg-blue-700 px-4 text-white hover:bg-blue-800" type="button">
                保存修改
              </Button>
            </div>
          </section>

          <div className="grid gap-6">
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="m-0 text-lg font-extrabold text-slate-950">账号安全</h2>
              <div className="mt-4 grid gap-3">
                {securityItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <article className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between" key={item.title}>
                      <div className="flex items-start gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                          <Icon size={18} aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="m-0 text-base font-extrabold text-slate-950">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" type="button">
                        {item.action}
                      </Button>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
