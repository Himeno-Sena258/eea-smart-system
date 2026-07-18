import { PlaceholderPage } from "@/components/placeholder-page"

export function UsersPage() {
  return (
    <PlaceholderPage
      title="用户与组织"
      description="管理员统一维护账号、组织架构、班级基础数据和审计入口。"
      sections={[
        {
          title: "账号管理",
          roles: ["ADMIN"],
          items: ["用户列表", "单个账号开户", "师生账号批量导入", "重置密码与启禁用"],
        },
        {
          title: "组织基础数据",
          roles: ["ADMIN"],
          items: ["学院/专业/行政班组织树", "行政班级维护", "角色筛选", "教务排课导入入口"],
        },
        {
          title: "安全审计",
          roles: ["ADMIN"],
          items: ["操作日志分页查询", "按用户/时间/模块筛选", "导出审计记录"],
        },
      ]}
    />
  )
}
