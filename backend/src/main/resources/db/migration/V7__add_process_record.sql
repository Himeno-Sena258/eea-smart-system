-- V6: 过程性记录表
DROP TABLE IF EXISTS `process_record`;
CREATE TABLE `process_record` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
    `teaching_class_id` bigint NOT NULL COMMENT '教学班ID',
    `student_id` bigint NOT NULL COMMENT '学生ID',
    `record_type` varchar(30) NOT NULL COMMENT '记录类型: ATTENDANCE-出勤, CLASSROOM-课堂表现, HOMEWORK_QUALITY-作业质量',
    `score` decimal(5,2) DEFAULT NULL COMMENT '评分',
    `remark` varchar(500) DEFAULT NULL COMMENT '备注',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_pr_tc_student` (`teaching_class_id`, `student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='过程性记录表';
