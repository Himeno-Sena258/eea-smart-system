import { PlaceholderPage } from "./placeholder-page"

export function CoursesPage() {
  return (
    <PlaceholderPage
      title="课程管理"
      description="课程信息共用页面，不同角色开放不同编辑能力。"
      sections={[
        {
          title: "课程体系",
          roles: ["DIRECTOR", "COORDINATOR"],
          items: ["课程列表", "课程基本信息", "课程类别/学期", "课程体系排序"],
        },
        {
          title: "课程大纲与考核",
          roles: ["COORDINATOR"],
          items: ["课程目标 CO 管理", "大纲编辑", "考核方式设置", "考核细项与 CO 映射"],
        },
        {
          title: "只读与教学入口",
          roles: ["INSTRUCTOR", "STUDENT"],
          items: ["查看课程大纲", "查看考核标准", "进入相关教学班", "查看课程资源"],
        },
      ]}
    />
  )
}
