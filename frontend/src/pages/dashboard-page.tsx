import { PlaceholderPage } from "./placeholder-page"

export function DashboardPage() {
  return (
    <PlaceholderPage
      title="工作台"
      description="根据登录角色展示不同的待办、统计卡片和快捷入口。"
      sections={[
        {
          title: "管理员视图",
          roles: ["ADMIN"],
          items: ["账号开户待办", "组织数据完整度", "最近审计日志", "批量导入入口"],
        },
        {
          title: "专业建设视图",
          roles: ["DIRECTOR"],
          items: ["专业达成度概览", "薄弱指标点预警", "自评报告进度", "待处理问卷统计"],
        },
        {
          title: "教学执行视图",
          roles: ["COORDINATOR", "INSTRUCTOR", "STUDENT"],
          items: ["课程质量概览", "待录成绩", "待上传佐证", "个人成绩与问卷提醒"],
        },
      ]}
    />
  )
}
