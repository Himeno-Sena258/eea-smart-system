-- Repair the demo attainment data after the seed data was merged into V1/V2.
-- The previous seed attempted to insert SE-302 into scheme 10, but course_code
-- was globally unique, so the insert was ignored and the scheme 10 attainment
-- calculation chain was left incomplete.

SET @drop_course_code_index_sql := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE `course` DROP INDEX `uk_course_code`',
        'SELECT 1'
    )
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'course'
      AND index_name = 'uk_course_code'
);
PREPARE drop_course_code_index_stmt FROM @drop_course_code_index_sql;
EXECUTE drop_course_code_index_stmt;
DEALLOCATE PREPARE drop_course_code_index_stmt;

SET @add_course_scheme_code_index_sql := (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE `course` ADD UNIQUE KEY `uk_course_scheme_code` (`scheme_id`, `course_code`)',
        'SELECT 1'
    )
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'course'
      AND index_name = 'uk_course_scheme_code'
);
PREPARE add_course_scheme_code_index_stmt FROM @add_course_scheme_code_index_sql;
EXECUTE add_course_scheme_code_index_stmt;
DEALLOCATE PREPARE add_course_scheme_code_index_stmt;

-- Ensure scheme 10 has its own SE-302 course and a complete course catalog.
INSERT INTO `course` (`id`, `course_code`, `course_name`, `credits`, `hours`, `scheme_id`) VALUES
(101, 'SE-302', '软件工程', 4.0, 64, 10),
(102, 'CS-201', '数据结构与算法', 4.5, 72, 10),
(103, 'CS-301', '数据库系统原理', 3.5, 56, 10),
(104, 'CS-304', '计算机网络', 3.5, 56, 10),
(105, 'CS-303', '操作系统设计', 4.0, 64, 10),
(106, 'AI-101', 'Python与人工智能基础', 3.0, 48, 10),
(107, 'SE-401', 'Web全栈开发技术', 3.5, 56, 10)
ON DUPLICATE KEY UPDATE
    `course_name` = VALUES(`course_name`),
    `credits` = VALUES(`credits`),
    `hours` = VALUES(`hours`),
    `scheme_id` = VALUES(`scheme_id`);

-- Ensure readable course objectives exist for all scheme 10 demo courses.
INSERT INTO `course_objective` (`id`, `course_id`, `objective_code`, `content`) VALUES
(1011, 101, 'CO1', '掌握软件生命周期模型、需求工程与体系结构设计的核心理论。'),
(1012, 101, 'CO2', '能够使用 UML 工具完成复杂软件系统的面向对象分析与设计。'),
(1013, 101, 'CO3', '能够运用软件测试与质量保证技术对系统进行全面单元与集成测试。'),
(1021, 102, 'CO1', '掌握线性表、树、图等核心数据结构的逻辑特性与存储实现。'),
(1022, 102, 'CO2', '能够对排序、查找算法的时空复杂度进行定量分析。'),
(2001, 103, 'CO1', '掌握数据库模型、关系代数与事务管理的核心概念。'),
(2002, 103, 'CO2', '能够运用数据库知识完成 SQL 查询、建模与优化。'),
(2003, 104, 'CO1', '掌握计算机网络体系结构与协议分层的核心原理。'),
(2004, 104, 'CO2', '能够分析网络协议、传输机制与复杂网络工程问题。'),
(2005, 105, 'CO1', '掌握操作系统进程、内存、文件与设备管理的核心原理。'),
(2006, 105, 'CO2', '能够分析系统资源调度、并发控制与性能瓶颈问题。'),
(2007, 106, 'CO1', '掌握 Python 程序设计与人工智能基础算法。'),
(2008, 106, 'CO2', '能够运用人工智能基础知识完成简单机器学习应用设计。'),
(2009, 107, 'CO1', '掌握 Web 前后端开发、接口协作与工程化构建方法。'),
(2010, 107, 'CO2', '能够完成前后端交互、部署与持续集成相关工程任务。')
ON DUPLICATE KEY UPDATE
    `course_id` = VALUES(`course_id`),
    `objective_code` = VALUES(`objective_code`),
    `content` = VALUES(`content`);

-- Ensure the teaching classes referenced by the repaired attainment data exist.
INSERT INTO `teaching_class` (`id`, `course_id`, `class_name`, `semester`, `teacher_id`) VALUES
(1001, 101, '软件工程-2024春季01班', '2024春', 1021),
(1002, 101, '软件工程-2024春季02班', '2024春', 1031),
(1003, 102, '数据结构与算法-2024春季01班', '2024春', 1032),
(1004, 103, '数据库系统原理-2024秋季01班', '2024秋', 1022),
(2003, 104, '计算机网络-2024秋季01班', '2024秋', 1031),
(2004, 105, '操作系统设计-2024秋季01班', '2024秋', 1032),
(2005, 106, 'Python与人工智能基础-2024秋季01班', '2024秋', 1031),
(2006, 107, 'Web全栈开发技术-2024秋季01班', '2024秋', 1032)
ON DUPLICATE KEY UPDATE
    `course_id` = VALUES(`course_id`),
    `class_name` = VALUES(`class_name`),
    `semester` = VALUES(`semester`),
    `teacher_id` = VALUES(`teacher_id`);

INSERT IGNORE INTO `teaching_class_student` (`teaching_class_id`, `student_id`) VALUES
(1001, 2001), (1001, 2002), (1001, 2003), (1001, 2004), (1001, 2005),
(1002, 2006), (1002, 2007), (1002, 2008), (1002, 2009), (1002, 2010),
(1003, 2011), (1003, 2012), (1003, 2013), (1003, 2014), (1003, 2015),
(2003, 2006), (2003, 2007), (2003, 2008), (2003, 2009), (2003, 2010),
(2006, 2001), (2006, 2002), (2006, 2003), (2006, 2004), (2006, 2005);

-- Replace scheme 10 OBE mappings with one coherent matrix. Director attainment
-- calculation sums weight * course objective attainment, so every indicator's
-- weights below are intentionally kept near 1.000.
DELETE m
FROM `course_obj_indicator_map` m
JOIN `grad_indicator_point` gip ON gip.`id` = m.`indicator_point_id`
JOIN `grad_requirement` gr ON gr.`id` = gip.`req_id`
WHERE gr.`scheme_id` = 10;

INSERT INTO `course_obj_indicator_map` (`course_objective_id`, `indicator_point_id`, `weight`) VALUES
(1021, 1011, 0.450),
(2003, 1011, 0.250),
(2007, 1011, 0.300),
(1022, 1012, 0.550),
(2001, 1012, 0.250),
(2005, 1012, 0.200),
(1011, 1013, 0.650),
(2002, 1013, 0.350),
(1012, 1021, 0.600),
(2004, 1021, 0.400),
(2006, 1022, 0.550),
(1013, 1022, 0.450),
(1012, 1031, 0.400),
(2009, 1031, 0.300),
(2010, 1031, 0.300),
(1013, 1032, 0.500),
(2002, 1032, 0.250),
(2006, 1032, 0.250),
(2004, 1041, 0.500),
(2010, 1041, 0.500),
(2009, 1051, 0.550),
(2007, 1051, 0.450);

-- Remove old duplicated/zero course attainment rows for scheme 10 objectives.
DELETE ca
FROM `course_attainment` ca
JOIN `course_objective` co ON co.`id` = ca.`course_objective_id`
JOIN `course` c ON c.`id` = co.`course_id`
WHERE c.`scheme_id` = 10;

INSERT INTO `course_attainment` (`id`, `teaching_class_id`, `course_objective_id`, `attainment_val`, `calculated_at`) VALUES
(11001, 1001, 1011, 0.860, '2026-06-30 00:00:00'),
(11002, 1001, 1012, 0.830, '2026-06-30 00:00:00'),
(11003, 1001, 1013, 0.810, '2026-06-30 00:00:00'),
(11004, 1003, 1021, 0.820, '2026-06-30 00:00:00'),
(11005, 1003, 1022, 0.780, '2026-06-30 00:00:00'),
(11006, 1004, 2001, 0.740, '2026-06-30 00:00:00'),
(11007, 1004, 2002, 0.800, '2026-06-30 00:00:00'),
(11008, 2003, 2003, 0.760, '2026-06-30 00:00:00'),
(11009, 2003, 2004, 0.770, '2026-06-30 00:00:00'),
(11010, 2004, 2005, 0.700, '2026-06-30 00:00:00'),
(11011, 2004, 2006, 0.720, '2026-06-30 00:00:00'),
(11012, 2005, 2007, 0.720, '2026-06-30 00:00:00'),
(11013, 2005, 2008, 0.800, '2026-06-30 00:00:00'),
(11014, 2006, 2009, 0.780, '2026-06-30 00:00:00'),
(11015, 2006, 2010, 0.760, '2026-06-30 00:00:00');

-- Keep persisted tables consistent with what the DirectorService recalculates.
DELETE FROM `grad_indicator_attainment`
WHERE `scheme_id` = 10 AND `grade` = 2024;

INSERT INTO `grad_indicator_attainment` (`id`, `scheme_id`, `grade`, `indicator_point_id`, `attainment_val`, `calculated_at`) VALUES
(12001, 10, 2024, 1011, 0.775, '2026-06-30 00:00:00'),
(12002, 10, 2024, 1012, 0.754, '2026-06-30 00:00:00'),
(12003, 10, 2024, 1013, 0.839, '2026-06-30 00:00:00'),
(12004, 10, 2024, 1021, 0.806, '2026-06-30 00:00:00'),
(12005, 10, 2024, 1022, 0.761, '2026-06-30 00:00:00'),
(12006, 10, 2024, 1031, 0.794, '2026-06-30 00:00:00'),
(12007, 10, 2024, 1032, 0.785, '2026-06-30 00:00:00'),
(12008, 10, 2024, 1041, 0.765, '2026-06-30 00:00:00'),
(12009, 10, 2024, 1051, 0.753, '2026-06-30 00:00:00');

DELETE FROM `grad_requirement_attainment`
WHERE `scheme_id` = 10 AND `grade` = 2024;

INSERT INTO `grad_requirement_attainment` (`id`, `scheme_id`, `grade`, `req_id`, `attainment_val`, `calculated_at`) VALUES
(12101, 10, 2024, 101, 0.789, '2026-06-30 00:00:00'),
(12102, 10, 2024, 102, 0.784, '2026-06-30 00:00:00'),
(12103, 10, 2024, 103, 0.790, '2026-06-30 00:00:00'),
(12104, 10, 2024, 104, 0.765, '2026-06-30 00:00:00'),
(12105, 10, 2024, 105, 0.753, '2026-06-30 00:00:00'),
(12106, 10, 2024, 106, 0.000, '2026-06-30 00:00:00'),
(12107, 10, 2024, 107, 0.000, '2026-06-30 00:00:00'),
(12108, 10, 2024, 108, 0.000, '2026-06-30 00:00:00');
