# 后端接口与数据支持补充清单

更新时间：2026-07-21

本文档整理前端接入真实服务过程中发现的后端支持缺口。分类说明：

- **接口缺失**：数据库或业务数据基本具备，但后端没有暴露前端需要的查询/操作接口。
- **数据库不支持**：当前数据库没有对应业务实体或持久化结构，仅靠新增接口无法可靠实现。
- **数据库字段缺失**：已有表可以承载主体数据，但缺少状态、归属、文件、审阅等关键字段。

## 一、接口缺失

### 1. 自评报告：授课教师待办章节入口

前端影响：

- `/reports` 中授课教师无法发现自己被分配的报告章节。
- 当前只能让 `DIRECTOR` / `ADMIN` 通过 `/self-evaluation/reports` 查看报告列表。

现有支持：

- `self_evaluation_report`
- `report_section.assigned_to`
- `/self-evaluation/reports/{reportId}/sections`

建议补充接口：

```http
GET /self-evaluation/sections/my
```

建议返回字段：

```json
[
  {
    "id": 1,
    "reportId": 1,
    "reportTitle": "软件工程专业自评报告",
    "sectionCode": "4.1",
    "title": "持续改进",
    "content": "",
    "status": 1,
    "assignedTo": 10003,
    "updatedAt": "2026-07-21T10:00:00"
  }
]
```

### 2. 自评报告：真实文件导出接口

前端影响：

- `/reports` 只能展示 JSON 导出预览，不能下载 Word/PDF。

现有支持：

- `GET /self-evaluation/reports/{id}/export` 当前返回 JSON：
  - `report`
  - `sections`
  - `exportFormat`

建议补充接口：

```http
GET /self-evaluation/reports/{id}/export?format=docx
GET /self-evaluation/reports/{id}/export?format=pdf
```

返回方式：

- `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- 或 `Content-Type: application/pdf`
- 文件名通过 `Content-Disposition` 返回。

### 3. 达成度分析：课程负责人视图

前端影响：

- `/attainment` 中 `COORDINATOR` 角色没有真实达成度入口。
- 当前只有：
  - `DIRECTOR`: `/director/schemes/{schemeId}/attainment`
  - `INSTRUCTOR`: `/teacher/classes/{classId}/attainment`
  - `STUDENT`: `/student/attainment`

现有支持：

- 有 `COORDINATOR` 角色。
- 有 `CoordinatorController`，但主要是课程大纲/课程负责人看板类接口。
- 有 `course_attainment` 表，可按课程、课程目标、教学班聚合。

建议补充接口：

```http
GET /coordinator/courses
GET /coordinator/courses/{courseId}/attainment
GET /coordinator/courses/{courseId}/teaching-classes/attainment
```

建议支持维度：

- 课程负责人负责的课程列表
- 单课程 CO 达成度汇总
- 同课程不同教学班横向对比
- 低达成 CO 列表

### 4. 持续改进：全专业/课程级聚合查询

前端影响：

- `/improvements` 中 `DIRECTOR` / `COORDINATOR` 只能按教学班查看记录。
- 无法实现原型中的全专业、课程级持续改进总览。

现有支持：

- `/teaching-classes/{teachingClassId}/improvements`
- `/teacher/classes/{classId}/improvements`
- `continuous_improvement` 表

建议补充接口：

```http
GET /director/improvements?schemeId=&grade=&courseId=&teacherId=&status=
GET /coordinator/improvements?courseId=&semester=&teacherId=&status=
GET /improvements/{id}
```

建议返回时补充关联展示字段：

- 课程名称
- 教学班名称
- 教师姓名
- 低达成 CO
- 达成度值
- 改进记录状态

### 5. 个人中心：修改个人资料接口

前端影响：

- `/profile` 只能读取 `/auth/me`，不能保存邮箱、手机号等个人资料。

现有支持：

- `/auth/me`
- `/auth/password`
- `sys_user.email`
- `sys_user.phone`

建议补充接口：

```http
PUT /auth/me
```

建议请求体：

```json
{
  "email": "user@example.edu.cn",
  "phone": "13800138000"
}
```

说明：

- 不建议允许用户自行改账号、角色、组织归属。
- 账号、角色、组织仍由管理员接口维护。

### 6. 课程页：学生/教师课程详情的按角色聚合入口

前端影响：

- `/courses` 目前主要依赖通用课程、培养方案、课程目标、考核方式等接口。
- 对学生“我的课程”、教师“我负责/我授课课程”的精确视图支持不足。

建议补充接口：

```http
GET /student/courses
GET /teacher/courses
GET /coordinator/courses
```

用途：

- 减少前端从全量课程中过滤。
- 避免学生看到未修课程。
- 避免教师看到无关课程。

## 二、数据库不支持

### 1. 个人头像/头像文件

前端影响：

- `/profile` 不能做真实头像上传、头像展示。

当前数据库问题：

- `sys_user` 没有头像字段。
- 没有用户附件/头像文件表。

建议方案：

轻量方案：

```sql
ALTER TABLE sys_user ADD COLUMN avatar_url varchar(500) NULL COMMENT '头像地址';
```

更完整方案：

新增用户文件表：

```sql
CREATE TABLE user_file (
  id bigint primary key auto_increment,
  user_id bigint not null,
  file_type varchar(30) not null,
  file_name varchar(255) not null,
  file_url varchar(500) not null,
  uploaded_at timestamp not null default current_timestamp
);
```

配套接口：

```http
POST /auth/me/avatar
DELETE /auth/me/avatar
```

### 2. 真实报告文件产物

前端影响：

- 自评报告无法下载已生成的 Word/PDF 文件。
- 当前只能即时返回 JSON 预览。

当前数据库问题：

- 没有报告导出文件记录表。
- 无法记录导出格式、文件路径、生成状态、生成时间、生成者。

建议新增表：

```sql
CREATE TABLE report_export_file (
  id bigint primary key auto_increment,
  report_id bigint not null,
  format varchar(20) not null,
  file_name varchar(255) not null,
  file_path varchar(500) not null,
  generated_by bigint null,
  generated_at timestamp not null default current_timestamp,
  status tinyint not null default 1
);
```

### 3. 注册申请流程

前端影响：

- `/register` 只能作为“注册关闭”占位页。
- 如果未来要求开放学生/教师自助注册，当前数据库没有申请、审批、激活流程支撑。

当前数据库问题：

- 只有管理员创建用户和导入用户。
- 没有注册申请表。

建议新增表：

```sql
CREATE TABLE user_registration_request (
  id bigint primary key auto_increment,
  username varchar(50) not null,
  real_name varchar(50) not null,
  email varchar(100) null,
  phone varchar(20) null,
  requested_role varchar(50) not null,
  org_id bigint null,
  status tinyint not null default 0,
  review_comment varchar(500) null,
  reviewed_by bigint null,
  reviewed_at timestamp null,
  created_at timestamp not null default current_timestamp
);
```

说明：

- 如果系统定位为管理员统一开户，则无需补充注册能力。

## 三、数据库字段缺失

### 1. 持续改进记录缺审核状态字段

前端影响：

- `/improvements` 无法实现“草稿 / 已提交 / 已审阅 / 退回”等状态流转。
- 目前只能展示已存在记录，不能做真实审核。

当前表：

- `continuous_improvement`

当前字段：

- `id`
- `teaching_class_id`
- `problem_analysis`
- `improvement_measures`
- `created_by`
- `created_at`

建议新增字段：

```sql
ALTER TABLE continuous_improvement
  ADD COLUMN status tinyint NOT NULL DEFAULT 1 COMMENT '状态: 0-草稿, 1-已提交, 2-已审阅, 3-退回',
  ADD COLUMN reviewed_by bigint NULL COMMENT '审阅人ID',
  ADD COLUMN reviewed_at timestamp NULL COMMENT '审阅时间',
  ADD COLUMN reviewer_comment varchar(1000) NULL COMMENT '审阅意见',
  ADD COLUMN updated_at timestamp NULL COMMENT '更新时间';
```

配套接口：

```http
PUT /improvements/{id}/status
PUT /improvements/{id}/review
```

### 2. 持续改进记录缺低达成目标快照字段

前端影响：

- 教师提交时 `TeacherController` 支持 `lowAttainmentCos` DTO，但 common 表 `continuous_improvement` 没有对应字段。
- 后续查看历史记录时，低达成目标只能重新计算或从 VO 拼接，无法保留当时提交快照。

建议新增字段：

```sql
ALTER TABLE continuous_improvement
  ADD COLUMN low_attainment_cos varchar(500) NULL COMMENT '提交时低达成课程目标快照';
```

### 3. 持续改进记录缺改进周期字段

前端影响：

- 无法区分“本轮教学周期”“下一轮教学周期”“整改后复核周期”。
- 不利于 PDCA 闭环追踪。

建议新增字段：

```sql
ALTER TABLE continuous_improvement
  ADD COLUMN cycle_label varchar(100) NULL COMMENT '改进周期',
  ADD COLUMN follow_up_at timestamp NULL COMMENT '复核时间',
  ADD COLUMN follow_up_result text NULL COMMENT '复核结果';
```

### 4. 报告章节缺截止时间/提交时间字段

前端影响：

- `/reports` 只能显示章节状态和更新时间。
- 无法实现章节待办、逾期、提交时间、审阅时间。

当前表：

- `report_section`

建议新增字段：

```sql
ALTER TABLE report_section
  ADD COLUMN due_at timestamp NULL COMMENT '章节截止时间',
  ADD COLUMN submitted_at timestamp NULL COMMENT '提交时间',
  ADD COLUMN reviewed_by bigint NULL COMMENT '审阅人ID',
  ADD COLUMN reviewed_at timestamp NULL COMMENT '审阅时间',
  ADD COLUMN review_comment varchar(1000) NULL COMMENT '审阅意见';
```

### 5. 课程资源/佐证材料缺在线预览元信息

前端影响：

- 当前文件类接口更偏上传/下载，前端难以做预览、文件类型图标、文件大小展示。

涉及表：

- `course_resource`
- `evidence_material`

建议新增字段：

```sql
ALTER TABLE course_resource
  ADD COLUMN mime_type varchar(100) NULL COMMENT '文件 MIME 类型',
  ADD COLUMN file_size bigint NULL COMMENT '文件大小',
  ADD COLUMN preview_url varchar(500) NULL COMMENT '预览地址';

ALTER TABLE evidence_material
  ADD COLUMN mime_type varchar(100) NULL COMMENT '文件 MIME 类型',
  ADD COLUMN file_size bigint NULL COMMENT '文件大小',
  ADD COLUMN preview_url varchar(500) NULL COMMENT '预览地址';
```

### 6. 课程大纲缺版本/审核流字段

前端影响：

- 课程负责人原型中有大纲审核状态，但通用课程大纲接口难以支撑完整审核流。
- 后端 `CoordinatorSyllabusVO` 有审核状态概念，但通用课程大纲实体/接口需要统一承载。

建议检查并补齐字段：

```sql
ALTER TABLE course_syllabus
  ADD COLUMN version varchar(50) NULL COMMENT '大纲版本',
  ADD COLUMN status tinyint NOT NULL DEFAULT 0 COMMENT '状态: 0-草稿, 1-待审核, 2-已通过, 3-退回',
  ADD COLUMN submitted_at timestamp NULL COMMENT '提交审核时间',
  ADD COLUMN reviewed_by bigint NULL COMMENT '审核人ID',
  ADD COLUMN reviewed_at timestamp NULL COMMENT '审核时间',
  ADD COLUMN review_comment varchar(1000) NULL COMMENT '审核意见';
```

配套接口：

```http
PUT /courses/{courseId}/syllabus/submit
PUT /courses/{courseId}/syllabus/review
```

## 四、Dashboard 需要补充的字段

当前 `/dashboard/*` 接口实际只返回：

- `title`
- `userId`
- `roles`
- `notice`，目前仅 `ADMIN` 有

前端 Dashboard 已经接入真实接口，但只能展示上述基础字段。若要恢复原型中的统计卡片、待办、预警、快捷任务等内容，建议后端统一扩展 Dashboard 返回结构。

### 1. 通用字段

建议所有角色 Dashboard 都返回以下基础字段：

```json
{
  "title": "角色工作台标题",
  "userId": 1,
  "roles": ["DIRECTOR"],
  "notice": "欢迎语或系统提示",
  "generatedAt": "2026-07-21T10:00:00",
  "stats": [],
  "todos": [],
  "warnings": [],
  "quickActions": []
}
```

字段说明：

| 字段 | 类型 | 说明 | 支持情况 |
| --- | --- | --- | --- |
| `title` | string | 工作台标题 | 已支持 |
| `userId` | number | 当前用户 ID | 已支持 |
| `roles` | string[] | 当前用户角色 | 已支持 |
| `notice` | string | 角色提示语 | 部分支持 |
| `generatedAt` | string | 看板数据生成时间 | 接口字段缺失 |
| `stats` | array | 统计卡片 | 接口聚合缺失 |
| `todos` | array | 待办列表 | 接口聚合缺失，部分依赖字段缺失 |
| `warnings` | array | 预警列表 | 接口聚合缺失 |
| `quickActions` | array | 后端控制的快捷入口 | 可选，当前前端本地维护 |

### 2. `stats` 统计卡片字段

建议结构：

```json
{
  "key": "courseCount",
  "label": "课程数",
  "value": 12,
  "unit": "门",
  "trend": 0.08,
  "status": "NORMAL"
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `key` | string | 统计项唯一标识 |
| `label` | string | 展示名称 |
| `value` | number/string | 统计值 |
| `unit` | string | 单位 |
| `trend` | number | 环比/同比变化，可选 |
| `status` | string | `NORMAL` / `WARNING` / `DANGER` |

### 3. `todos` 待办字段

建议结构：

```json
{
  "id": "report-section-1",
  "title": "完成自评报告 4.1 章节",
  "description": "持续改进章节待提交",
  "targetPath": "/reports",
  "priority": "HIGH",
  "dueAt": "2026-07-30T23:59:59"
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 待办唯一标识 |
| `title` | string | 待办标题 |
| `description` | string | 待办说明 |
| `targetPath` | string | 前端跳转路径 |
| `priority` | string | `LOW` / `MEDIUM` / `HIGH` |
| `dueAt` | string | 截止时间，可选 |

注意：

- 报告章节待办依赖 `report_section.due_at`、`submitted_at` 等字段。
- 持续改进待办依赖 `continuous_improvement.status`、`follow_up_at` 等字段。
- 如果暂不补数据库字段，只能返回“数量统计”，不能可靠返回逾期/待审待办。

### 4. `warnings` 预警字段

建议结构：

```json
{
  "id": "low-co-1",
  "type": "LOW_ATTAINMENT",
  "title": "CO2 达成度低于阈值",
  "description": "SE-302 软件工程 01 班 CO2 = 0.650",
  "value": 0.65,
  "threshold": 0.68,
  "targetPath": "/attainment"
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 预警唯一标识 |
| `type` | string | 预警类型 |
| `title` | string | 预警标题 |
| `description` | string | 预警说明 |
| `value` | number/string | 当前值 |
| `threshold` | number/string | 阈值 |
| `targetPath` | string | 处理入口 |

### 5. `ADMIN` Dashboard 建议字段

建议 `GET /dashboard/admin` 增加：

```json
{
  "stats": [
    { "key": "userCount", "label": "用户数", "value": 0, "unit": "人" },
    { "key": "organizationCount", "label": "组织数", "value": 0, "unit": "个" },
    { "key": "roleCount", "label": "角色数", "value": 0, "unit": "个" },
    { "key": "auditLogCount", "label": "审计日志", "value": 0, "unit": "条" }
  ],
  "todos": [],
  "warnings": []
}
```

数据来源：

- `sys_user`
- `sys_organization`
- `sys_role`
- `audit_log`

当前判断：

- 属于**接口聚合缺失**，数据库基本支持。

### 6. `DIRECTOR` Dashboard 建议字段

建议 `GET /dashboard/director` 增加：

```json
{
  "stats": [
    { "key": "schemeCount", "label": "培养方案", "value": 0, "unit": "个" },
    { "key": "requirementCount", "label": "毕业要求", "value": 0, "unit": "项" },
    { "key": "indicatorCount", "label": "指标点", "value": 0, "unit": "个" },
    { "key": "averageAttainment", "label": "平均达成度", "value": 0.76, "unit": "" }
  ],
  "todos": [
    {
      "id": "report-progress",
      "title": "自评报告章节待完成",
      "targetPath": "/reports",
      "priority": "HIGH"
    }
  ],
  "warnings": [
    {
      "id": "low-grad-indicator",
      "type": "LOW_GRAD_ATTAINMENT",
      "title": "存在低达成指标点",
      "targetPath": "/attainment"
    }
  ]
}
```

数据来源：

- `program_scheme`
- `grad_requirement`
- `grad_indicator_point`
- `grad_indicator_attainment`
- `grad_requirement_attainment`
- `self_evaluation_report`
- `report_section`

当前判断：

- 统计和预警属于**接口聚合缺失**。
- 报告章节待办的截止/提交/审阅状态依赖 `report_section` 字段补充，属于**数据库字段缺失**。

### 7. `COORDINATOR` Dashboard 建议字段

建议 `GET /dashboard/coordinator` 增加：

```json
{
  "stats": [
    { "key": "managedCourseCount", "label": "负责课程", "value": 0, "unit": "门" },
    { "key": "syllabusPendingCount", "label": "待审核大纲", "value": 0, "unit": "份" },
    { "key": "objectiveBindingCount", "label": "课程目标绑定", "value": 0, "unit": "项" },
    { "key": "lowCourseObjectiveCount", "label": "低达成 CO", "value": 0, "unit": "项" }
  ],
  "todos": [],
  "warnings": []
}
```

数据来源：

- 课程负责人和课程关系，目前需要确认是否已有稳定归属字段。
- `course`
- `course_objective`
- `assessment_method`
- `assessment_item`
- `course_attainment`
- `course_syllabus`

当前判断：

- 课程负责人达成度与课程归属视图属于**接口缺失**。
- 如果课程负责人和课程没有明确绑定关系，则属于**数据库字段缺失/关系缺失**，建议补充 `course.coordinator_id` 或课程负责人关联表。
- 大纲审核流字段见“课程大纲缺版本/审核流字段”。

### 8. `INSTRUCTOR` Dashboard 建议字段

建议 `GET /dashboard/teacher` 增加：

```json
{
  "stats": [
    { "key": "teachingClassCount", "label": "授课教学班", "value": 0, "unit": "个" },
    { "key": "scoreInputProgress", "label": "成绩录入进度", "value": 0.8, "unit": "" },
    { "key": "evidenceProgress", "label": "材料归档进度", "value": 0.6, "unit": "" },
    { "key": "lowCourseObjectiveCount", "label": "低达成 CO", "value": 0, "unit": "项" }
  ],
  "todos": [
    {
      "id": "score-input",
      "title": "完成成绩录入",
      "targetPath": "/teaching-classes",
      "priority": "HIGH"
    },
    {
      "id": "improvement-submit",
      "title": "提交持续改进分析",
      "targetPath": "/improvements",
      "priority": "MEDIUM"
    }
  ],
  "warnings": []
}
```

数据来源：

- `teaching_class`
- `teaching_class_student`
- `student_score`
- `assessment_item`
- `course_attainment`
- `continuous_improvement`
- `evidence_material`

当前判断：

- 大部分属于**接口聚合缺失**。
- 材料归档进度如果要精确计算，需要定义“应归档材料清单/要求”，当前数据库可能不足，属于**数据库不支持或字段缺失**。

### 9. `STUDENT` Dashboard 建议字段

建议 `GET /dashboard/student` 增加：

```json
{
  "stats": [
    { "key": "courseCount", "label": "已修/在修课程", "value": 0, "unit": "门" },
    { "key": "averageScore", "label": "平均成绩", "value": 0, "unit": "分" },
    { "key": "averageAttainment", "label": "平均达成度", "value": 0.75, "unit": "" },
    { "key": "pendingSurveyCount", "label": "待填问卷", "value": 0, "unit": "份" }
  ],
  "todos": [
    {
      "id": "pending-survey",
      "title": "填写课程评价问卷",
      "targetPath": "/surveys",
      "priority": "MEDIUM"
    }
  ],
  "warnings": []
}
```

数据来源：

- `teaching_class_student`
- `student_course_score`
- `student_score`
- `survey_questionnaire`
- `survey_answer`
- 学生达成度计算服务

当前判断：

- 属于**接口聚合缺失**。
- 如果要展示“学习预警处理状态”，需要额外预警记录表或状态字段，属于**数据库不支持/字段缺失**。

## 五、优先级建议

### P0：影响当前页面完整闭环

1. `/auth/me` 的资料更新接口。
2. 自评报告教师“我的章节”接口。
3. 自评报告真实 Word/PDF 导出。
4. 持续改进审核状态字段与审核接口。
5. Dashboard 角色统计字段：`stats`、`todos`、`warnings`。

### P1：影响角色视图完整性

1. 课程负责人达成度接口。
2. 全专业/课程级持续改进聚合接口。
3. 教师/学生/课程负责人按角色课程列表。
4. Dashboard 按角色聚合接口完善。

### P2：体验增强

1. 头像上传与头像字段。
2. 文件预览元信息。
3. 报告章节截止时间、提交时间、审阅意见。
4. 注册申请流程，前提是产品决定开放自助注册。
