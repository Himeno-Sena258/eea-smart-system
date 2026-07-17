import { PlaceholderPage } from "./placeholder-page"

export function ProgramPage() {
  return (
    <PlaceholderPage
      title="培养方案"
      description="专业负责人维护培养方案、毕业要求、指标点和课程支撑矩阵。"
      sections={[
        {
          title: "方案版本",
          roles: ["DIRECTOR"],
          items: ["培养方案列表", "草稿/发布/归档", "版本详情", "关联专业与年级"],
        },
        {
          title: "毕业要求与指标点",
          roles: ["DIRECTOR"],
          items: ["12 条毕业要求", "二级指标点拆解", "合格阈值", "初始化模板"],
        },
        {
          title: "支撑矩阵",
          roles: ["DIRECTOR"],
          items: ["课程-指标点支撑权重", "权重和校验", "矩阵保存", "发布前检查"],
        },
      ]}
    />
  )
}
