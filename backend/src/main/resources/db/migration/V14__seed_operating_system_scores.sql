-- Seed assessment data for CS-303 Operating System Design demo class.
-- This class belongs to teacher_wu and is used in the teaching-class,
-- attainment and continuous-improvement demonstration flow.

INSERT IGNORE INTO `teaching_class_student` (`teaching_class_id`, `student_id`) VALUES
(2004, 2006),
(2004, 2007),
(2004, 2008),
(2004, 2009),
(2004, 2010);

INSERT INTO `assessment_method` (`id`, `course_id`, `name`, `weight`) VALUES
(15007, 105, '期末考试', 0.50),
(15008, 105, '课程实验', 0.30),
(15009, 105, '平时作业', 0.20)
ON DUPLICATE KEY UPDATE
    `course_id` = VALUES(`course_id`),
    `name` = VALUES(`name`),
    `weight` = VALUES(`weight`);

INSERT INTO `assessment_item` (`id`, `method_id`, `name`, `max_score`, `course_objective_id`) VALUES
(15109, 15007, '期末考试-系统原理题', 45.00, 2005),
(15110, 15007, '期末考试-调度与并发分析题', 55.00, 2006),
(15111, 15008, '进程调度与同步实验', 100.00, 2006),
(15112, 15009, '内存与文件系统作业', 100.00, 2005)
ON DUPLICATE KEY UPDATE
    `method_id` = VALUES(`method_id`),
    `name` = VALUES(`name`),
    `max_score` = VALUES(`max_score`),
    `course_objective_id` = VALUES(`course_objective_id`);

INSERT INTO `student_score` (`id`, `student_id`, `teaching_class_id`, `assessment_item_id`, `actual_score`) VALUES
(15241, 2006, 2004, 15109, 38.00),
(15242, 2006, 2004, 15110, 46.00),
(15243, 2006, 2004, 15111, 82.00),
(15244, 2006, 2004, 15112, 86.00),
(15245, 2007, 2004, 15109, 35.00),
(15246, 2007, 2004, 15110, 42.00),
(15247, 2007, 2004, 15111, 78.00),
(15248, 2007, 2004, 15112, 80.00),
(15249, 2008, 2004, 15109, 41.00),
(15250, 2008, 2004, 15110, 50.00),
(15251, 2008, 2004, 15111, 90.00),
(15252, 2008, 2004, 15112, 88.00),
(15253, 2009, 2004, 15109, 29.00),
(15254, 2009, 2004, 15110, 35.00),
(15255, 2009, 2004, 15111, 68.00),
(15256, 2009, 2004, 15112, 72.00),
(15257, 2010, 2004, 15109, 33.00),
(15258, 2010, 2004, 15110, 39.00),
(15259, 2010, 2004, 15111, 74.00),
(15260, 2010, 2004, 15112, 76.00)
ON DUPLICATE KEY UPDATE
    `student_id` = VALUES(`student_id`),
    `teaching_class_id` = VALUES(`teaching_class_id`),
    `assessment_item_id` = VALUES(`assessment_item_id`),
    `actual_score` = VALUES(`actual_score`);

DELETE FROM `student_course_score`
WHERE `teaching_class_id` = 2004;

INSERT INTO `student_course_score`
(`id`, `student_id`, `course_id`, `teaching_class_id`, `homework_score`, `experiment_score`, `exam_score`, `total_score`, `is_passed`) VALUES
(15411, 2006, 105, 2004, 86.00, 82.00, 84.00, 83.80, 1),
(15412, 2007, 105, 2004, 80.00, 78.00, 77.00, 78.10, 1),
(15413, 2008, 105, 2004, 88.00, 90.00, 91.00, 89.90, 1),
(15414, 2009, 105, 2004, 72.00, 68.00, 64.00, 67.20, 1),
(15415, 2010, 105, 2004, 76.00, 74.00, 72.00, 73.40, 1);
