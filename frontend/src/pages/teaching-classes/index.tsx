import { PlaceholderPage } from "@/components/placeholder-page"

export function TeachingClassesPage() {
  return (
    <PlaceholderPage
      title="教学班"
      description="围绕教学班聚合名单、成绩、材料和班级层面质量数据。"
      sections={[
        {
          title: "跨班监控",
          roles: ["COORDINATOR"],
          items: ["教学班列表", "跨班达成度对比", "教师/学期筛选", "班级均分对比"],
        },
        {
          title: "授课执行",
          roles: ["INSTRUCTOR"],
          items: ["学生花名册", "分项成绩录入", "Excel 导入", "佐证材料上传"],
        },
        {
          title: "学生视图",
          roles: ["STUDENT"],
          items: ["我的教学班", "小项成绩明细", "综合成绩总表", "课程相关材料"],
        },
      ]}
    />
  )
}
