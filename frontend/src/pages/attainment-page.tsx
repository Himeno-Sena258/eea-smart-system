import { PlaceholderPage } from "./placeholder-page"

export function AttainmentPage() {
  return (
    <PlaceholderPage
      title="达成度分析"
      description="同一分析入口下按角色切换专业、课程、班级和个人维度。"
      sections={[
        {
          title: "专业维度",
          roles: ["DIRECTOR"],
          items: ["毕业要求达成度", "指标点预警", "责任课程定位", "专业驾驶舱"],
        },
        {
          title: "课程与班级维度",
          roles: ["COORDINATOR", "INSTRUCTOR"],
          items: ["课程目标达成度", "跨教学班对比", "班级 CO 计算", "低达成目标分析"],
        },
        {
          title: "个人维度",
          roles: ["STUDENT"],
          items: ["个人毕业要求达成", "短板指标点", "课程目标达成明细"],
        },
      ]}
    />
  )
}
