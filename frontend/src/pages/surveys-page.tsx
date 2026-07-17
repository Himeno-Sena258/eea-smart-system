import { PlaceholderPage } from "./placeholder-page"

export function SurveysPage() {
  return (
    <PlaceholderPage
      title="问卷评价"
      description="间接评价问卷的管理、填写和统计入口。"
      sections={[
        {
          title: "问卷管理",
          roles: ["DIRECTOR"],
          items: ["问卷列表", "创建/编辑问卷", "开放/关闭问卷", "统计结果"],
        },
        {
          title: "问卷填写",
          roles: ["STUDENT"],
          items: ["待填问卷", "在线作答", "提交状态", "历史问卷"],
        },
      ]}
    />
  )
}
