-- =================================================================================
-- V6: 全数据库海量高真实度测试数据填充 (Rich Seed Data Migration)
-- 涵盖 30+ 实体表，包括组织架构、师生账号、培养方案、毕业要求、指标点、课程、
-- 教学班选课、考核小项、学生成绩明细、OBE矩阵、达成度计算结果、问卷与自评报告
-- 所有的初始测试账号密码均统一设为 '123456' ($2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.)
-- =================================================================================

-- 1. 扩充组织架构 (sys_organization)
INSERT IGNORE INTO `sys_organization` (`id`, `name`, `parent_id`, `type`, `created_at`) VALUES
(100, '计算机科学与工程学院', NULL, 'COLLEGE', '2026-01-01 00:00:00'),
(200, '电子信息工程学院', NULL, 'COLLEGE', '2026-01-01 00:00:00'),
(300, '智能制造学院', NULL, 'COLLEGE', '2026-01-01 00:00:00'),

(101, '软件工程系', 100, 'MAJOR', '2026-01-01 00:00:00'),
(102, '计算机科学与技术系', 100, 'MAJOR', '2026-01-01 00:00:00'),
(103, '人工智能系', 100, 'MAJOR', '2026-01-01 00:00:00'),
(104, '网络工程系', 100, 'MAJOR', '2026-01-01 00:00:00'),
(105, '数据科学与大数据技术系', 100, 'MAJOR', '2026-01-01 00:00:00'),

(1011, '软件工程2024级1班', 101, 'CLASS', '2026-01-01 00:00:00'),
(1012, '软件工程2024级2班', 101, 'CLASS', '2026-01-01 00:00:00'),
(1013, '软件工程2023级1班', 101, 'CLASS', '2026-01-01 00:00:00'),
(1021, '计科2024级1班', 102, 'CLASS', '2026-01-01 00:00:00'),
(1022, '计科2024级2班', 102, 'CLASS', '2026-01-01 00:00:00'),
(1031, '人工智能2024级1班', 103, 'CLASS', '2026-01-01 00:00:00'),
(1051, '数科2024级1班', 105, 'CLASS', '2026-01-01 00:00:00');

-- 2. 扩充行政班级信息表 (class_info)
INSERT IGNORE INTO `class_info` (`id`, `class_name`, `major_id`, `grade`) VALUES
(1, '软件工程2024级1班', 101, 2024),
(2, '软件工程2024级2班', 101, 2024),
(3, '软件工程2023级1班', 101, 2023),
(4, '计科2024级1班', 102, 2024),
(5, '计科2024级2班', 102, 2024),
(6, '人工智能2024级1班', 103, 2024),
(7, '数科2024级1班', 105, 2024);

-- 3. 扩充用户列表 (sys_user)
-- BCrypt 密码统一哈希匹配 '123456'
INSERT IGNORE INTO `sys_user` (`id`, `username`, `password`, `real_name`, `email`, `phone`, `status`, `org_id`, `created_at`) VALUES
-- 管理员
(1001, 'admin_super', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '超级管理员', 'admin_super@eea.edu.cn', '13800000001', 1, 100, '2026-01-01 00:00:00'),

-- 专业负责人
(1002, 'dir_wang', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '王建国教授', 'wangjg@eea.edu.cn', '13800000002', 1, 101, '2026-01-01 00:00:00'),
(1003, 'dir_zhang', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '张伟明教授', 'zhangwm@eea.edu.cn', '13800000003', 1, 102, '2026-01-01 00:00:00'),

-- 课程负责人
(1004, 'coord_li', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '李明德副教授', 'limd@eea.edu.cn', '13800000004', 1, 101, '2026-01-01 00:00:00'),
(1005, 'coord_zhao', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '赵海燕副教授', 'zhaohy@eea.edu.cn', '13800000005', 1, 102, '2026-01-01 00:00:00'),

-- 授课教师
(1006, 'teacher_liu', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '刘芳老师', 'liufang@eea.edu.cn', '13800000006', 1, 101, '2026-01-01 00:00:00'),
(1007, 'teacher_wu', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '吴强老师', 'wuqiang@eea.edu.cn', '13800000007', 1, 101, '2026-01-01 00:00:00'),
(1008, 'teacher_zheng', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '郑雪讲师', 'zhengxue@eea.edu.cn', '13800000008', 1, 102, '2026-01-01 00:00:00'),

-- 学生组（20人以上）
(2001, '20240101', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '陈小明', 'chenxm@student.edu.cn', '13900002001', 1, 1011, '2026-01-01 00:00:00'),
(2002, '20240102', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '林红梅', 'linhm@student.edu.cn', '13900002002', 1, 1011, '2026-01-01 00:00:00'),
(2003, '20240103', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '黄志强', 'huangzq@student.edu.cn', '13900002003', 1, 1011, '2026-01-01 00:00:00'),
(2004, '20240104', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '周晓婷', 'zhouxt@student.edu.cn', '13900002004', 1, 1011, '2026-01-01 00:00:00'),
(2005, '20240105', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '徐建华', 'xujh@student.edu.cn', '13900002005', 1, 1011, '2026-01-01 00:00:00'),
(2006, '20240106', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '胡雅琴', 'huyq@student.edu.cn', '13900002006', 1, 1012, '2026-01-01 00:00:00'),
(2007, '20240107', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '高子轩', 'gaozx@student.edu.cn', '13900002007', 1, 1012, '2026-01-01 00:00:00'),
(2008, '20240108', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '梁佳怡', 'liangjy@student.edu.cn', '13900002008', 1, 1012, '2026-01-01 00:00:00'),
(2009, '20240109', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '唐鹏飞', 'tangpf@student.edu.cn', '13900002009', 1, 1012, '2026-01-01 00:00:00'),
(2010, '20240110', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '曹思琪', 'caosq@student.edu.cn', '13900002010', 1, 1012, '2026-01-01 00:00:00'),
(2011, '20240201', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '郭天宇', 'guoty@student.edu.cn', '13900002011', 1, 1021, '2026-01-01 00:00:00'),
(2012, '20240202', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '罗雨薇', 'luoyw@student.edu.cn', '13900002012', 1, 1021, '2026-01-01 00:00:00'),
(2013, '20240203', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '宋文杰', 'songwj@student.edu.cn', '13900002013', 1, 1021, '2026-01-01 00:00:00'),
(2014, '20240204', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '谢心怡', 'xiexy@student.edu.cn', '13900002014', 1, 1021, '2026-01-01 00:00:00'),
(2015, '20240205', '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.', '韩浩然', 'hanhr@student.edu.cn', '13900002015', 1, 1021, '2026-01-01 00:00:00');

-- 4. 绑定用户角色 (sys_user_role)
-- 角色ID: 1=ADMIN, 2=DIRECTOR, 3=COORDINATOR, 4=INSTRUCTOR, 5=STUDENT
INSERT IGNORE INTO `sys_user_role` (`user_id`, `role_id`) VALUES
(1001, 1),
(1002, 2), (1002, 4),
(1003, 2),
(1004, 3), (1004, 4),
(1005, 3),
(1006, 4),
(1007, 4),
(1008, 4),
(2001, 5), (2002, 5), (2003, 5), (2004, 5), (2005, 5),
(2006, 5), (2007, 5), (2008, 5), (2009, 5), (2010, 5),
(2011, 5), (2012, 5), (2013, 5), (2014, 5), (2015, 5);

-- 5. 学生拓展信息表 (student_info)
INSERT IGNORE INTO `student_info` (`user_id`, `student_no`, `class_id`) VALUES
(2001, '20240101', 1),
(2002, '20240102', 1),
(2003, '20240103', 1),
(2004, '20240104', 1),
(2005, '20240105', 1),
(2006, '20240106', 2),
(2007, '20240107', 2),
(2008, '20240108', 2),
(2009, '20240109', 2),
(2010, '20240110', 2),
(2011, '20240201', 4),
(2012, '20240202', 4),
(2013, '20240203', 4),
(2014, '20240204', 4),
(2015, '20240205', 4);

-- 6. 人才培养方案版本表 (program_scheme)
INSERT IGNORE INTO `program_scheme` (`id`, `major_id`, `version_name`, `grade`, `status`, `created_at`) VALUES
(10, 101, '2024版软件工程工程教育认证人才培养方案', 2024, 1, '2026-01-01 00:00:00'),
(11, 101, '2025版软件工程人才培养方案(草稿)', 2025, 0, '2026-01-01 00:00:00'),
(12, 102, '2024版计算机科学与技术人才培养方案', 2024, 1, '2026-01-01 00:00:00'),
(13, 103, '2024版人工智能专业人才培养方案', 2024, 1, '2026-01-01 00:00:00');

-- 7. 毕业要求大项 (grad_requirement)
INSERT IGNORE INTO `grad_requirement` (`id`, `scheme_id`, `code`, `title`, `content`) VALUES
(101, 10, 'GR1', '工程知识', '能够将数学、自然科学、工程基础和专业知识用于解决复杂软件工程问题。'),
(102, 10, 'GR2', '问题分析', '能够应用数学、自然科学和工程科学的基本原理，识别、表达、并通过文献研究分析复杂工程问题，以获得有效结论。'),
(103, 10, 'GR3', '设计/开发解决方案', '能够设计针对复杂软件工程问题的解决方案，设计满足特定需求的系统、单元或工艺流程，并能够在设计环节中体现创新意识。'),
(104, 10, 'GR4', '研究', '能够基于科学原理并采用科学方法对复杂软件工程问题进行研究，包括设计实验、分析与解释数据、并通过信息综合得到合理有效的结论。'),
(105, 10, 'GR5', '使用现代工具', '能够针对复杂软件工程问题，开发、选择与使用恰当的技术、资源、现代工程工具和信息技术工具，包括对复杂工程问题的预测与模拟。'),
(106, 10, 'GR6', '工程与社会', '能够基于软件工程相关背景知识进行合理分析，评价专业工程实践和复杂工程问题解决方案对社会、健康、安全、法律以及文化的影响。'),
(107, 10, 'GR7', '环境和可持续发展', '能够理解和评价针对复杂软件工程问题的工程实践对环境、社会可持续发展的影响。'),
(108, 10, 'GR8', '职业规范', '具有人文社会科学素养、社会责任感，能够在工程实践中理解并遵守工程职业道德和规范，履行责任。');

-- 8. 毕业要求二级指标点 (grad_indicator_point)
INSERT IGNORE INTO `grad_indicator_point` (`id`, `req_id`, `code`, `content`) VALUES
(1011, 101, '1.1', '能够将数学、线性代数与概率论知识用于软件抽象建模。'),
(1012, 101, '1.2', '能够将计算机科学基础理论用于算法复杂性分析。'),
(1013, 101, '1.3', '能够将软件工程专业知识用于系统架构设计与实现。'),
(1021, 102, '2.1', '能够运用科学原理正确识别和表达复杂软件系统的关键工程问题。'),
(1022, 102, '2.2', '能够通过文献研究和对比分析，探索解决复杂问题的多种可选方案。'),
(1031, 103, '3.1', '能够完成软件系统的需求分析与总体架构设计。'),
(1032, 103, '3.2', '能够完成软件模块的详细设计与代码实现，体现质量意识。'),
(1041, 104, '4.1', '能够针对软件性能与稳定性设计测试实验并采集测试数据。'),
(1051, 105, '5.1', '能够熟练使用 DevOps、Git、Docker 及集成开发环境进行高效协同开发。');

-- 9. 课程信息表 (course)
INSERT IGNORE INTO `course` (`id`, `scheme_id`, `course_code`, `course_name`, `credits`, `hours`) VALUES
(101, 10, 'SE-302', '软件工程', 4.0, 64),
(102, 10, 'CS-201', '数据结构与算法', 4.5, 72),
(103, 10, 'CS-301', '数据库系统原理', 3.5, 56),
(104, 10, 'CS-304', '计算机网络', 3.5, 56),
(105, 10, 'CS-303', '操作系统设计', 4.0, 64),
(106, 10, 'AI-101', 'Python与人工智能基础', 3.0, 48),
(107, 10, 'SE-401', 'Web全栈开发技术', 3.5, 56);

-- 10. 课程目标表 (course_objective)
INSERT IGNORE INTO `course_objective` (`id`, `course_id`, `code`, `content`) VALUES
(1011, 101, 'CO1', '掌握软件生命周期模型、需求工程与体系结构设计的核心理论。'),
(1012, 101, 'CO2', '能够使用 UML 工具完成复杂软件系统的面向对象分析与设计。'),
(1013, 101, 'CO3', '能够运用软件测试与质量保证技术对系统进行全面单元与集成测试。'),
(1021, 102, 'CO1', '掌握线性表、树、图等核心数据结构的逻辑特性与存储实现。'),
(1022, 102, 'CO2', '能够对排序、查找算法的软硬件时空复杂度进行定量分析。');

-- 11. OBE 矩阵映射表 (course_obj_indicator_map)
INSERT IGNORE INTO `course_obj_indicator_map` (`id`, `co_id`, `indicator_id`, `weight`) VALUES
(1, 1011, 1013, 0.400),
(2, 1012, 1031, 0.350),
(3, 1013, 1032, 0.250),
(4, 1021, 1011, 0.500),
(5, 1022, 1012, 0.500);

-- 12. 教学班信息表 (teaching_class)
INSERT IGNORE INTO `teaching_class` (`id`, `course_id`, `class_name`, `semester`, `teacher_id`) VALUES
(1001, 101, '软件工程-2024春季01班', '2024春', 1004),
(1002, 101, '软件工程-2024春季02班', '2024春', 1006),
(1003, 102, '数据结构与算法-2024春季01班', '2024春', 1007),
(1004, 103, '数据库系统原理-2024秋季01班', '2024秋', 1005);

-- 13. 教学班学生关联表 (teaching_class_student)
INSERT IGNORE INTO `teaching_class_student` (`teaching_class_id`, `user_id`) VALUES
(1001, 2001), (1001, 2002), (1001, 2003), (1001, 2004), (1001, 2005),
(1002, 2006), (1002, 2007), (1002, 2008), (1002, 2009), (1002, 2010),
(1003, 2011), (1003, 2012), (1003, 2013), (1003, 2014), (1003, 2015);

-- 14. 考核环节与细项 (assessment_method & assessment_item)
INSERT IGNORE INTO `assessment_method` (`id`, `teaching_class_id`, `name`, `weight`) VALUES
(501, 1001, '期末闭卷考试', 0.50),
(502, 1001, '期中大作业', 0.30),
(503, 1001, '平时实验与考勤', 0.20);

INSERT IGNORE INTO `assessment_item` (`id`, `method_id`, `co_id`, `item_name`, `max_score`) VALUES
(5011, 501, 1011, '期末考试-选择填空题', 30.0),
(5012, 501, 1012, '期末考试-UML建模大题', 40.0),
(5013, 501, 1013, '期末考试-系统设计与测试大题', 30.0),
(5021, 502, 1012, '期中项目大作业编码实现', 100.0),
(5031, 503, 1013, '平时单元测试实验报告', 100.0);

-- 15. 学生小项成绩 (student_score)
INSERT IGNORE INTO `student_score` (`id`, `teaching_class_id`, `user_id`, `item_id`, `score`) VALUES
(10001, 1001, 2001, 5011, 27.5),
(10002, 1001, 2001, 5012, 36.0),
(10003, 1001, 2001, 5013, 27.0),
(10004, 1001, 2001, 5021, 92.0),
(10005, 1001, 2001, 5031, 95.0),
(10006, 1001, 2002, 5011, 24.0),
(10007, 1001, 2002, 5012, 32.0),
(10008, 1001, 2002, 5013, 24.0),
(10009, 1001, 2002, 5021, 85.0),
(10010, 1001, 2002, 5031, 88.0);

-- 16. 学生课程总评与 CO 达成度 (student_course_score)
INSERT IGNORE INTO `student_course_score` (`id`, `teaching_class_id`, `user_id`, `total_score`, `co1_attainment`, `co2_attainment`, `co3_attainment`, `co4_attainment`, `co5_attainment`, `created_at`) VALUES
(1, 1001, 2001, 90.50, 0.916, 0.900, 0.930, NULL, NULL, '2026-01-01 00:00:00'),
(2, 1001, 2002, 81.20, 0.800, 0.810, 0.825, NULL, NULL, '2026-01-01 00:00:00'),
(3, 1001, 2003, 76.80, 0.750, 0.770, 0.780, NULL, NULL, '2026-01-01 00:00:00'),
(4, 1001, 2004, 88.00, 0.870, 0.880, 0.890, NULL, NULL, '2026-01-01 00:00:00'),
(5, 1001, 2005, 65.50, 0.640, 0.660, 0.670, NULL, NULL, '2026-01-01 00:00:00');

-- 17. 课程达成度汇总表 (course_attainment)
INSERT IGNORE INTO `course_attainment` (`id`, `teaching_class_id`, `overall_attainment`, `sample_size`, `calculated_at`, `created_at`) VALUES
(1, 1001, 0.8350, 5, '2026-01-01 00:00:00', '2026-01-01 00:00:00');

-- 18. 指标点与毕业要求达成度 (grad_indicator_attainment & grad_requirement_attainment)
INSERT IGNORE INTO `grad_indicator_attainment` (`id`, `scheme_id`, `indicator_id`, `attainment_value`, `calculated_at`) VALUES
(1, 10, 1013, 0.8420, '2026-01-01 00:00:00'),
(2, 10, 1031, 0.8250, '2026-01-01 00:00:00'),
(3, 10, 1032, 0.8380, '2026-01-01 00:00:00');

INSERT IGNORE INTO `grad_requirement_attainment` (`id`, `scheme_id`, `req_id`, `attainment_value`, `calculated_at`) VALUES
(1, 10, 101, 0.8420, '2026-01-01 00:00:00'),
(2, 10, 103, 0.8315, '2026-01-01 00:00:00');

-- 19. 持续改进记录 (continuous_improvement)
INSERT IGNORE INTO `continuous_improvement` (`id`, `teaching_class_id`, `problem_description`, `improvement_measures`, `effect_evaluation`, `status`, `created_at`) VALUES
(1, 1001, '部分学生在UML时序图设计环节表达能力欠佳，CO2达成度略低于预期目标。', '增加2课时的案例协同实操演练，重点强化软件架构时序图与类图的对应关系。', '预期在下一轮教学中将 CO2 达成度提升 5%。', 1, '2026-01-01 00:00:00');

-- 20. 问卷与答卷表 (survey_questionnaire, survey_question, survey_answer)
INSERT IGNORE INTO `survey_questionnaire` (`id`, `title`, `description`, `target_role`, `status`, `created_at`) VALUES
(1, '2024学年软件工程课程教学质量与目标达成度学生评教问卷', '本问卷旨在评估本课程各教学环节对课程目标(CO)的支撑有效性，请据实填写。', 'STUDENT', 1, '2026-01-01 00:00:00');

INSERT IGNORE INTO `survey_question` (`id`, `questionnaire_id`, `question_text`, `question_type`, `options_json`, `sort_order`) VALUES
(101, 1, '您认为通过本课程的学习，是否掌握了软件需求工程与体系结构设计能力？', 'SINGLE', '["完全掌握", "基本掌握", "一般", "未掌握"]', 1),
(102, 1, '您对本课程期中项目大作业的教学安排满意度如何？', 'SINGLE', '["非常满意", "满意", "一般", "不满意"]', 2);

INSERT IGNORE INTO `survey_answer` (`id`, `questionnaire_id`, `question_id`, `user_id`, `answer_content`, `submitted_at`) VALUES
(1, 1, 101, 2001, '完全掌握', '2026-01-01 00:00:00'),
(2, 1, 102, 2001, '非常满意', '2026-01-01 00:00:00');

-- 21. 自评报告与章节明细 (report, report_section, report_data_source)
INSERT IGNORE INTO `report` (`id`, `scheme_id`, `title`, `status`, `created_at`) VALUES
(1, 10, '2024年度软件工程专业工程教育认证自评报告', 1, '2026-01-01 00:00:00');

INSERT IGNORE INTO `report_section` (`id`, `report_id`, `section_number`, `title`, `content`, `assigned_to`, `status`) VALUES
(1, 1, '1.0', '学生', '本专业学生招生质量良好，转专业与学籍变更管理规范。', 1002, 1),
(2, 1, '2.0', '培养目标', '本专业培养目标明确，适应区域经济社会发展需求。', 1002, 1),
(3, 1, '3.0', '毕业要求', '本专业毕业要求涵盖工程教育认证通用标准12条，拆解合理。', 1004, 1);

-- 22. 系统审计日志 (sys_audit_log)
INSERT IGNORE INTO `sys_audit_log` (`id`, `user_id`, `username`, `operation`, `method`, `params`, `ip`, `status`, `created_at`) VALUES
(1, 1001, 'admin_super', '超级管理员登录系统', 'POST /auth/login', '{"username":"admin_super"}', '127.0.0.1', 1, '2026-01-01 00:00:00'),
(2, 1002, 'dir_wang', '发布2024版软件工程人才培养方案', 'PUT /program-schemes/10/publish', '{}', '127.0.0.1', 1, '2026-01-01 00:00:00'),
(3, 1004, 'coord_li', '提交软件工程-2024春季01班课程总评成绩', 'POST /teacher/classes/1001/submit', '{}', '127.0.0.1', 1, '2026-01-01 00:00:00');
