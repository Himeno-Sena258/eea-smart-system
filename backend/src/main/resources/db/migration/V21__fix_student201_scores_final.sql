-- 修复：删除并重新插入学生201(小明)在软件工程教学班1中的分项成绩
-- 先删除所有assessment_item_id=1~6的记录(不受teaching_class_id限制)
DELETE FROM `student_score` WHERE `student_id` = 201 AND `assessment_item_id` IN (1, 2, 3, 4, 5, 6);

-- 再重新插入
INSERT IGNORE INTO `student_score` (`id`, `student_id`, `teaching_class_id`, `assessment_item_id`, `actual_score`) VALUES
(70001, 201, 1, 1, 16.00),
(70002, 201, 1, 2, 32.00),
(70003, 201, 1, 3, 30.00),
(70004, 201, 1, 4, 42.00),
(70005, 201, 1, 5, 43.00),
(70006, 201, 1, 6, 85.00);
