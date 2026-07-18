import { PlaceholderPage } from "@/components/placeholder-page"

export function ProfilePage() {
  return (
    <PlaceholderPage
      title="个人中心"
      description="管理个人资料、账号安全设置与当前角色信息。"
      sections={[
        {
          title: "基础信息",
          roles: ["ADMIN", "DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"],
          items: ["姓名与联系方式", "所属学院或班级", "当前账号状态", "个人头像占位"],
        },
        {
          title: "账号安全",
          roles: ["ADMIN", "DIRECTOR", "COORDINATOR", "INSTRUCTOR", "STUDENT"],
          items: ["修改密码", "登录设备", "安全提醒", "退出登录"],
        },
      ]}
    />
  )
}
