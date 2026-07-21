-- Add structured survey questions so the frontend can render forms and answer
-- reports without exposing raw JSON as the primary UI.

INSERT INTO `survey_question` (`id`, `questionnaire_id`, `question_code`, `title`, `question_type`, `options`, `sort_order`) VALUES
(13001, 1, 'Q1', '课程目标是否清晰、可理解', 'SCORE', '["1","2","3","4","5"]', 1),
(13002, 1, 'Q2', '课程内容组织是否合理', 'SCORE', '["1","2","3","4","5"]', 2),
(13003, 1, 'Q3', '课程是否帮助你掌握核心知识', 'SCORE', '["1","2","3","4","5"]', 3),
(13004, 1, 'Q4', '课程考核方式是否公平有效', 'SCORE', '["1","2","3","4","5"]', 4),
(13005, 1, 'Q5', '教师教学投入与反馈是否充分', 'SCORE', '["1","2","3","4","5"]', 5),
(13006, 1, 'Q6', '你对本课程的总体满意度', 'SCORE', '["1","2","3","4","5"]', 6),
(13007, 2, 'Q1', '培养目标是否符合专业发展需要', 'SCORE', '["1","2","3","4","5"]', 1),
(13008, 2, 'Q2', '课程体系是否支撑毕业要求达成', 'SCORE', '["1","2","3","4","5"]', 2),
(13009, 2, 'Q3', '实践教学是否有效提升工程能力', 'SCORE', '["1","2","3","4","5"]', 3),
(13010, 2, 'Q4', '你是否愿意推荐本专业', 'CHOICE', '["愿意","不确定","不愿意"]', 4),
(13011, 2, 'Q5', '对培养方案的建议', 'TEXT', '[]', 5)
ON DUPLICATE KEY UPDATE
    `questionnaire_id` = VALUES(`questionnaire_id`),
    `question_code` = VALUES(`question_code`),
    `title` = VALUES(`title`),
    `question_type` = VALUES(`question_type`),
    `options` = VALUES(`options`),
    `sort_order` = VALUES(`sort_order`);

UPDATE `survey_answer`
SET `raw_answers_json` = JSON_OBJECT(
    'Q1', ELT(1 + MOD(`id`, 3), '4', '5', '3'),
    'Q2', ELT(1 + MOD(`id` + 1, 3), '4', '5', '3'),
    'Q3', ELT(1 + MOD(`id` + 2, 3), '4', '5', '3'),
    'Q4', '4',
    'Q5', '5',
    'Q6', ELT(1 + MOD(`id`, 2), '4', '5')
)
WHERE `questionnaire_id` = 1;

UPDATE `survey_answer`
SET `raw_answers_json` = JSON_OBJECT(
    'Q1', ELT(1 + MOD(`id`, 3), '4', '5', '3'),
    'Q2', ELT(1 + MOD(`id` + 1, 3), '4', '5', '3'),
    'Q3', '4',
    'Q4', ELT(1 + MOD(`id`, 3), '愿意', '不确定', '愿意'),
    'Q5', '希望继续加强项目实践和企业案例。'
)
WHERE `questionnaire_id` = 2;
