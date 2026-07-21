-- Seed continuous improvement records for director/coordinator demo views.
INSERT INTO `continuous_improvement`
(`id`, `teaching_class_id`, `problem_analysis`, `improvement_measures`, `status`, `reviewed_by`, `reviewed_at`, `reviewer_comment`, `low_attainment_cos`, `cycle_label`, `follow_up_at`, `follow_up_result`, `created_by`, `created_at`, `updated_at`)
VALUES
(16001, 1001, '软件工程课程中，部分学生在需求建模、UML 时序图表达和测试用例设计环节得分偏低，说明从需求到设计再到验证的闭环能力还不够稳定。', '下一轮增加需求评审工作坊和分组建模演练，将项目检查点前移到第 6 周，并要求每组提交需求追踪矩阵和测试覆盖说明。', 1, 1011, '2026-07-10 10:00:00', '改进措施聚焦课程目标短板，建议在期中检查时补充一次横向对比。', 'CO2, CO3', '2024春季课程改进', '2026-09-15 23:59:59', '已完成一次示范案例讲解，学生第二次建模作业平均分提升。', 1021, '2026-07-01 09:00:00', '2026-07-10 10:00:00'),
(16002, 1002, '软件工程第二教学班在综合设计题中架构拆分不够清晰，部分学生无法说明模块边界和接口职责。', '增加一次代码走查和架构复盘课，要求学生围绕模块职责、接口契约和异常处理补交设计说明。', 0, NULL, NULL, NULL, 'CO3', '2024春季课程改进', '2026-09-20 23:59:59', NULL, 1031, '2026-07-02 10:20:00', '2026-07-02 10:20:00'),
(16003, 1003, '数据结构与算法教学班中，学生在图算法综合应用题和复杂度分析题上失分较多，反映抽象建模与算法解释能力不足。', '下一轮安排图算法专题训练，加入可视化推演任务，并在实验报告中增加复杂度分析必填项。', 2, 1021, '2026-07-11 14:30:00', '措施可执行，建议补充一次面向低分学生的课后辅导记录。', 'CO2', '2024春季课程改进', '2026-09-18 23:59:59', '已建立错题清单，并完成第一次专题辅导。', 1032, '2026-07-03 15:00:00', '2026-07-11 14:30:00'),
(16004, 2004, '操作系统设计课程中，进程同步与文件系统实验完成度不均衡，部分学生能运行程序但无法解释关键机制。', '增加实验前导问题清单，要求学生提交关键系统调用说明，并在验收时增加口头追问环节。', 1, 1021, '2026-07-12 09:40:00', '建议持续跟踪实验解释能力改善情况。', 'CO1, CO3', '2024秋季课程改进', '2026-10-10 23:59:59', NULL, 1032, '2026-07-04 11:00:00', '2026-07-12 09:40:00'),
(16005, 2006, 'Web 全栈开发技术课程中，学生在前后端接口联调、权限状态处理和部署问题定位方面表现不稳定。', '下一轮加入接口契约评审、Mock 到真实服务切换训练，并要求每组保留联调问题记录和修复说明。', 1, 1011, '2026-07-13 16:20:00', '改进方向符合工程实践能力培养要求。', 'CO2, CO3', '2024秋季课程改进', '2026-10-15 23:59:59', '已完成接口契约模板设计，准备在下轮项目中使用。', 1032, '2026-07-05 14:15:00', '2026-07-13 16:20:00')
ON DUPLICATE KEY UPDATE
  `problem_analysis` = VALUES(`problem_analysis`),
  `improvement_measures` = VALUES(`improvement_measures`),
  `status` = VALUES(`status`),
  `reviewed_by` = VALUES(`reviewed_by`),
  `reviewed_at` = VALUES(`reviewed_at`),
  `reviewer_comment` = VALUES(`reviewer_comment`),
  `low_attainment_cos` = VALUES(`low_attainment_cos`),
  `cycle_label` = VALUES(`cycle_label`),
  `follow_up_at` = VALUES(`follow_up_at`),
  `follow_up_result` = VALUES(`follow_up_result`),
  `created_by` = VALUES(`created_by`),
  `created_at` = VALUES(`created_at`),
  `updated_at` = VALUES(`updated_at`);
