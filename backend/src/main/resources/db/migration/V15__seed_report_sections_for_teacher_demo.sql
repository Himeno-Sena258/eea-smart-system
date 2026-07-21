-- Seed additional self-evaluation report sections for collaboration demos.
-- teacher_wu (1032) receives several writable sections for the instructor report page.

INSERT INTO `report_section`
(`id`, `report_id`, `section_code`, `title`, `content`, `status`, `assigned_to`, `due_at`, `submitted_at`, `reviewed_by`, `reviewed_at`, `review_comment`, `updated_at`) VALUES
(11, 1, '1.3', '师资队伍与教学条件', '本节用于描述专业师资结构、课程团队建设、实验环境与工程实践支撑条件。', 1, 1032, '2026-08-15 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(12, 1, '2.1', '课程目标与毕业要求对应关系', '本节用于说明课程目标如何支撑毕业要求指标点，并给出课程矩阵维护情况。', 1, 1032, '2026-08-18 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(13, 1, '2.2', '课程体系合理性说明', '本节用于分析课程体系对核心能力培养的覆盖情况，以及课程先修后续关系。', 0, 1031, '2026-08-20 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(14, 1, '3.2', '核心课程教学实施情况', '本节用于汇总核心课程教学班、考核方式、过程性评价与课程资源建设情况。', 1, 1032, '2026-08-22 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(15, 1, '3.3', '课程考核与评分标准', '本节用于描述考核细项、评分标准、达成度计算依据与成绩归档材料。', 0, 1033, '2026-08-25 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(16, 1, '4.1', '课程目标达成度评价', '本节用于汇总课程目标达成度评价结果，说明低达成目标和改进建议。', 1, 1032, '2026-08-28 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(17, 1, '4.2', '毕业要求达成度评价', '本节用于描述毕业要求指标点达成度计算、评价结果和主要证据。', 0, 101, '2026-08-30 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(18, 1, '5.1', '学生问卷与间接评价', '本节用于整理学生问卷、毕业生评价、用人单位评价等间接评价结果。', 1, 1034, '2026-09-02 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(19, 1, '5.2', '评价结果综合分析', '本节用于对直接评价与间接评价结果进行综合分析，识别主要问题。', 0, 1032, '2026-09-05 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(20, 1, '6.1', '持续改进机制', '本节用于说明课程、教学班和专业层面的持续改进闭环机制。', 1, 102, '2026-09-08 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(21, 1, '6.2', '改进措施与跟踪结果', '本节用于汇总已实施的改进措施、责任人、跟踪结果与后续计划。', 0, 1035, '2026-09-10 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00'),
(22, 1, '7.1', '支撑材料清单', '本节用于列出课程大纲、试卷、作业、实验报告、问卷和会议纪要等支撑材料。', 0, 1031, '2026-09-12 23:59:59', NULL, NULL, NULL, NULL, '2026-07-21 00:00:00')
ON DUPLICATE KEY UPDATE
    `report_id` = VALUES(`report_id`),
    `section_code` = VALUES(`section_code`),
    `title` = VALUES(`title`),
    `content` = VALUES(`content`),
    `status` = VALUES(`status`),
    `assigned_to` = VALUES(`assigned_to`),
    `due_at` = VALUES(`due_at`),
    `updated_at` = VALUES(`updated_at`);

INSERT INTO `report_data_source`
(`id`, `section_id`, `source_type`, `source_key`, `auto_fill_config`) VALUES
(10301, 12, 'TABLE', 'COURSE_INDICATOR_MATRIX', '{"report_id":1,"section":"2.1"}'),
(10302, 14, 'TABLE', 'TEACHING_CLASS_SCORE_GRID', '{"report_id":1,"section":"3.2"}'),
(10303, 16, 'ATTAINMENT', 'COURSE_OBJECTIVE_ATTAINMENT', '{"report_id":1,"section":"4.1"}'),
(10304, 17, 'ATTAINMENT', 'GRAD_REQUIREMENT_ATTAINMENT', '{"report_id":1,"section":"4.2"}'),
(10305, 18, 'SURVEY', 'QUESTIONNAIRE_STATISTICS', '{"report_id":1,"section":"5.1"}'),
(10306, 19, 'CHART', 'ATTAINMENT_AND_SURVEY_COMPARISON', '{"report_id":1,"section":"5.2"}'),
(10307, 21, 'TABLE', 'CONTINUOUS_IMPROVEMENT_RECORDS', '{"report_id":1,"section":"6.2"}')
ON DUPLICATE KEY UPDATE
    `section_id` = VALUES(`section_id`),
    `source_type` = VALUES(`source_type`),
    `source_key` = VALUES(`source_key`),
    `auto_fill_config` = VALUES(`auto_fill_config`);
