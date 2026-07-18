import type { RoleCode } from "@/models"

export type DashboardTone = "blue" | "green" | "amber" | "red" | "slate"

export interface DashboardStat {
  label: string
  value: string
  hint: string
  tone: DashboardTone
}

export interface DashboardTodo {
  title: string
  description: string
  action: string
  targetPath: string
  level: DashboardTone
}

export interface DashboardWarning {
  title: string
  description: string
  value: string
  threshold?: string
}

export interface DashboardQuickLink {
  title: string
  description: string
  targetPath: string
}

export interface DashboardChartItem {
  label: string
  value: number
  helper?: string
}

export interface RoleDashboardMock {
  role: RoleCode
  roleName: string
  title: string
  subtitle: string
  stats: DashboardStat[]
  todos: DashboardTodo[]
  warnings: DashboardWarning[]
  quickLinks: DashboardQuickLink[]
  chartTitle?: string
  chartItems?: DashboardChartItem[]
}

export const dashboardMockMap: Record<RoleCode, RoleDashboardMock> = {
  ADMIN: {
    role: "ADMIN",
    roleName: "系统管理员",
    title: "系统底座工作台",
    subtitle: "关注账号、组织、导入和审计等系统基础数据，不展示业务成绩与达成度明细。",
    stats: [
      { label: "启用账号", value: "1,842", hint: "当前可登录账号", tone: "blue" },
      { label: "全部账号", value: "2,156", hint: "含停用与启用账号", tone: "slate" },
      { label: "组织节点", value: "128", hint: "学院 / 专业 / 行政班", tone: "green" },
      { label: "今日审计", value: "36", hint: "关键操作记录", tone: "amber" },
    ],
    todos: [
      {
        title: "批量导入待校验",
        description: "师生账号导入模板存在 2 条校验提醒。",
        action: "查看导入",
        targetPath: "/admin/users",
        level: "amber",
      },
      {
        title: "组织节点补全",
        description: "软件工程 2024 级行政班信息需要确认。",
        action: "维护组织",
        targetPath: "/admin/users",
        level: "blue",
      },
    ],
    warnings: [],
    quickLinks: [
      { title: "新增账号", description: "管理员手动创建教师或学生账号", targetPath: "/admin/users" },
      { title: "组织架构", description: "维护学院、专业、行政班三级结构", targetPath: "/admin/users" },
      { title: "审计日志", description: "查看关键操作记录", targetPath: "/admin/users" },
    ],
  },
  DIRECTOR: {
    role: "DIRECTOR",
    roleName: "专业负责人",
    title: "专业宏观态势",
    subtitle: "查看培养方案、指标点达成、自评报告进度和专业级待办。",
    stats: [
      { label: "培养方案", value: "3", hint: "当前专业版本数", tone: "blue" },
      { label: "专业课程", value: "42", hint: "纳入认证课程", tone: "green" },
      { label: "指标点", value: "31", hint: "毕业要求拆解项", tone: "slate" },
      { label: "报告进度", value: "65%", hint: "章节完成比例", tone: "amber" },
    ],
    todos: [
      {
        title: "自评报告章节待处理",
        description: "第 4 章持续改进仍在编写中。",
        action: "查看报告",
        targetPath: "/reports",
        level: "amber",
      },
      {
        title: "课程支撑矩阵复核",
        description: "2024 版培养方案支撑权重需要确认。",
        action: "查看矩阵",
        targetPath: "/program",
        level: "blue",
      },
    ],
    warnings: [
      {
        title: "GR 2.1 达成度偏低",
        description: "问题分析指标点低于目标阈值。",
        value: "0.65",
        threshold: "0.68",
      },
    ],
    quickLinks: [
      { title: "培养方案", description: "维护毕业要求和指标点", targetPath: "/program" },
      { title: "达成度分析", description: "查看专业/年级级达成度", targetPath: "/attainment" },
      { title: "自评报告", description: "管理章节与自动填充数据源", targetPath: "/reports" },
    ],
    chartTitle: "毕业要求达成度摘要",
    chartItems: [
      { label: "工程知识", value: 0.78 },
      { label: "问题分析", value: 0.65, helper: "低于 0.68" },
      { label: "设计开发", value: 0.74 },
      { label: "现代工具", value: 0.82 },
    ],
  },
  COORDINATOR: {
    role: "COORDINATOR",
    roleName: "课程负责人",
    title: "课程质量总览",
    subtitle: "管理课程目标、考核方式、教学班横向质量和课程级改进记录。",
    stats: [
      { label: "课程目标", value: "5", hint: "CO1 至 CO5", tone: "blue" },
      { label: "考核权重", value: "1.00", hint: "权重校验通过", tone: "green" },
      { label: "考核细项", value: "12", hint: "已绑定课程目标", tone: "slate" },
      { label: "教学班", value: "3", hint: "本课程开课班级", tone: "amber" },
    ],
    todos: [
      {
        title: "复核考核细项绑定",
        description: "试卷第 2 题与 CO2 的绑定需要确认。",
        action: "查看课程",
        targetPath: "/courses",
        level: "blue",
      },
      {
        title: "查看最近改进记录",
        description: "软件工程 01 班提交了新的教学改进记录。",
        action: "查看改进",
        targetPath: "/improvements",
        level: "amber",
      },
    ],
    warnings: [
      {
        title: "平行班 CO2 极差偏高",
        description: "不同教学班 CO2 达成度差异需要关注。",
        value: "0.17",
      },
    ],
    quickLinks: [
      { title: "课程质量管理", description: "维护 CO 与考核配置", targetPath: "/courses" },
      { title: "教学班与成绩", description: "查看教学班汇总", targetPath: "/teaching-classes" },
      { title: "持续改进", description: "查看课程级改进记录", targetPath: "/improvements" },
    ],
    chartTitle: "平行班 CO 达成度",
    chartItems: [
      { label: "01 班", value: 0.82 },
      { label: "02 班", value: 0.68 },
      { label: "03 班", value: 0.75 },
    ],
  },
  INSTRUCTOR: {
    role: "INSTRUCTOR",
    roleName: "授课教师",
    title: "教学工作台",
    subtitle: "处理当前学期教学班成绩录入、佐证归档和班级改进分析。",
    stats: [
      { label: "教学班", value: "2", hint: "当前学期授课", tone: "blue" },
      { label: "学生人数", value: "86", hint: "合计选课人数", tone: "green" },
      { label: "录入完成", value: "78%", hint: "分项成绩进度", tone: "amber" },
      { label: "归档材料", value: "9", hint: "已上传佐证", tone: "slate" },
    ],
    todos: [
      {
        title: "软件工程 01 班 - 期末成绩录入",
        description: "还有 8 名学生的分项成绩待补充。",
        action: "去处理",
        targetPath: "/teaching-classes",
        level: "amber",
      },
      {
        title: "软件工程 01 班 - 高中低档试卷上传",
        description: "期末考试佐证材料尚未齐全。",
        action: "去归档",
        targetPath: "/teaching-classes",
        level: "blue",
      },
      {
        title: "提交持续改进分析报告",
        description: "CO2 不达标触发。",
        action: "撰写",
        targetPath: "/improvements",
        level: "red",
      },
    ],
    warnings: [
      {
        title: "CO2 达成度低于阈值",
        description: "需求建模相关考核项平均得分偏低。",
        value: "0.62",
        threshold: "0.68",
      },
    ],
    quickLinks: [
      { title: "成绩录入", description: "进入教学班成绩网格", targetPath: "/teaching-classes" },
      { title: "材料归档", description: "上传认证佐证材料", targetPath: "/teaching-classes" },
      { title: "班级改进", description: "填写教学改进分析", targetPath: "/improvements" },
    ],
  },
  STUDENT: {
    role: "STUDENT",
    roleName: "学生",
    title: "我的学业看板",
    subtitle: "查看个人课程成绩、学习达成情况和待填问卷。",
    stats: [
      { label: "选修课程", value: "4", hint: "当前已修课程", tone: "blue" },
      { label: "总评均分", value: "82.6", hint: "课程综合均分", tone: "green" },
      { label: "通过课程", value: "4", hint: "已达到通过线", tone: "slate" },
    ],
    todos: [
      {
        title: "教学环节满意度调查",
        description: "问卷将在 3 天后截止。",
        action: "立即填写",
        targetPath: "/surveys",
        level: "amber",
      },
    ],
    warnings: [],
    quickLinks: [
      { title: "我的成绩", description: "查看课程总评和分项明细", targetPath: "/teaching-classes" },
      { title: "达成度分析", description: "查看匿名均值对比", targetPath: "/attainment" },
      { title: "问卷评价", description: "填写可见问卷", targetPath: "/surveys" },
    ],
    chartTitle: "课程表现摘要",
    chartItems: [
      { label: "软件工程", value: 0.86 },
      { label: "系统分析", value: 0.79 },
      { label: "数据库", value: 0.83 },
      { label: "项目实践", value: 0.88 },
    ],
  },
}
