-- =================================================================================
-- V2: 新增学生综合总评成绩单表
-- =================================================================================

DROP TABLE IF EXISTS `student_course_score`;
CREATE TABLE `student_course_score` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `student_id` bigint NOT NULL COMMENT '学生ID',
  `course_id` bigint NOT NULL COMMENT '课程ID',
  `teaching_class_id` bigint NOT NULL COMMENT '教学班ID',
  `homework_score` decimal(5,2) DEFAULT NULL COMMENT '平时作业总成绩',
  `experiment_score` decimal(5,2) DEFAULT NULL COMMENT '课程实验总成绩',
  `exam_score` decimal(5,2) DEFAULT NULL COMMENT '期末卷面总分',
  `total_score` decimal(5,2) DEFAULT NULL COMMENT '综合总评成绩',
  `is_passed` tinyint DEFAULT '1' COMMENT '是否及格(1-及格, 0-不及格)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生综合总评成绩单';

-- 小明《软件工程》课程成绩
-- 期末 78/100×0.6 + 实验 85/100×0.2 + 作业 85/100×0.2 = 80.80
INSERT INTO `student_course_score`
(`student_id`, `course_id`, `teaching_class_id`, `homework_score`, `experiment_score`, `exam_score`, `total_score`, `is_passed`)
VALUES
(201, 1, 1, 85.00, 85.00, 78.00, 80.80, 1);
