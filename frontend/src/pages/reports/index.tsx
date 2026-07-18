import { PlaceholderPage } from "@/components/placeholder-page"

export function ReportsPage() {
  return (
    <PlaceholderPage
      title="自评报告"
      description="自评报告主表、章节协同、自动填充和导出统一入口。"
      sections={[
        {
          title: "报告管理",
          roles: ["DIRECTOR"],
          items: ["创建报告", "章节分派", "状态跟踪", "一键导出"],
        },
        {
          title: "章节协作",
          roles: ["DIRECTOR", "COORDINATOR", "INSTRUCTOR"],
          items: ["被分派章节", "富文本编辑", "自动填充数据源", "章节完成状态"],
        },
      ]}
    />
  )
}
