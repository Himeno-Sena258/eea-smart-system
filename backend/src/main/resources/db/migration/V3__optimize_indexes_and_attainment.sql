-- =================================================================================
-- V3: 数据库性能索引优化、冗余字段补充与毕业要求达成度统计表
-- =================================================================================

-- 1. 新增毕业要求二级指标点达成度结果表 (全专业/年级维度达成度固化表)
CREATE TABLE IF NOT EXISTS `grad_indicator_attainment` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `scheme_id` bigint NOT NULL COMMENT '培养方案ID',
    `grade` int NOT NULL COMMENT '年级(如 2024)',
    `indicator_point_id` bigint NOT NULL COMMENT '二级指标点ID',
    `attainment_val` decimal(4,3) NOT NULL COMMENT '直接达成度实测值(0.000 - 1.000)',
    `calculated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '统计生成时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_scheme_grade_ip` (`scheme_id`, `grade`, `indicator_point_id`),
    CONSTRAINT `fk_gia_scheme` FOREIGN KEY (`scheme_id`) REFERENCES `program_scheme` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_gia_ip` FOREIGN KEY (`indicator_point_id`) REFERENCES `grad_indicator_point` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕业要求二级指标点达成度结果表';

-- 2. 新增毕业要求一级大项达成度结果表
CREATE TABLE IF NOT EXISTS `grad_requirement_attainment` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `scheme_id` bigint NOT NULL COMMENT '培养方案ID',
    `grade` int NOT NULL COMMENT '年级(如 2024)',
    `req_id` bigint NOT NULL COMMENT '毕业要求大项ID',
    `attainment_val` decimal(4,3) NOT NULL COMMENT '达成度数值(0.000 - 1.000)',
    `calculated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '统计生成时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_scheme_grade_req` (`scheme_id`, `grade`, `req_id`),
    CONSTRAINT `fk_gra_scheme` FOREIGN KEY (`scheme_id`) REFERENCES `program_scheme` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_gra_req` FOREIGN KEY (`req_id`) REFERENCES `grad_requirement` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕业要求一级大项达成度结果表';

-- 3. student_score 增加 teaching_class_id 冗余列与索引，提升班级维度明细查询与计算效率
ALTER TABLE `student_score` 
    ADD COLUMN `teaching_class_id` bigint DEFAULT NULL COMMENT '教学班ID' AFTER `student_id`;

-- 根据现有选课关联表回填历史数据中的 teaching_class_id
UPDATE `student_score` ss
JOIN `teaching_class_student` tcs ON ss.student_id = tcs.student_id
SET ss.teaching_class_id = tcs.teaching_class_id
WHERE ss.teaching_class_id IS NULL;

-- 为 student_score 增加复合索引与外键约束
ALTER TABLE `student_score`
    ADD INDEX `idx_tc_item` (`teaching_class_id`, `assessment_item_id`),
    ADD CONSTRAINT `fk_score_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE;

-- 4. 为 student_course_score (V2) 增加联合唯一索引及外键约束
ALTER TABLE `student_course_score`
    ADD UNIQUE KEY `uk_student_tc` (`student_id`, `teaching_class_id`),
    ADD CONSTRAINT `fk_scs_student` FOREIGN KEY (`student_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
    ADD CONSTRAINT `fk_scs_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE,
    ADD CONSTRAINT `fk_scs_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE;

-- 5. 扩容 sys_audit_log 的 detail 字段类型，避免长 JSON 或详细操作日志被截断
ALTER TABLE `sys_audit_log`
    MODIFY COLUMN `detail` text DEFAULT NULL COMMENT '操作详情 JSON 或详细描述';
