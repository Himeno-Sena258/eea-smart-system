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
