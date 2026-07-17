import { PlaceholderPage } from "./placeholder-page"

export function ImprovementsPage() {
  return (
    <PlaceholderPage
      title="持续改进"
      description="把达成度和评价结果沉淀成专业、课程、班级改进记录。"
      sections={[
        {
          title: "专业改进",
          roles: ["DIRECTOR"],
          items: ["专业级问题分析", "培养方案调整决策", "责任人跟踪", "年度闭环记录"],
        },
        {
          title: "课程改进",
          roles: ["COORDINATOR"],
          items: ["课程质量报告", "跨班问题归因", "课程目标调整建议"],
        },
        {
          title: "班级反思",
          roles: ["INSTRUCTOR"],
          items: ["低达成 CO 原因分析", "教学改进措施", "提交时间", "历史反思"],
        },
      ]}
    />
  )
}
