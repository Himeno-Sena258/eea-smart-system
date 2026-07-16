    -- =================================================================================
    -- 工程教育专业认证智能服务系统 - 初始化数据库脚本 (init.sql)
    -- 适用数据库: MySQL 8.0+
    -- 字符集: utf8mb4 / utf8mb4_unicode_ci
    -- =================================================================================
    -- ---------------------------------------------------------------------------------
    -- 0. 数据库自动创建与切换
    -- ---------------------------------------------------------------------------------
    CREATE DATABASE IF NOT EXISTS `obe_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE `obe_system`;

    SET FOREIGN_KEY_CHECKS = 0;

    -- ---------------------------------------------------------------------------------
    -- 1. 系统与RBAC权限模块 (管理员维护，支持多角色切换)
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `sys_organization`;
    CREATE TABLE `sys_organization` (
                                        `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                        `name` varchar(100) NOT NULL COMMENT '机构/部门名称',
                                        `parent_id` bigint DEFAULT NULL COMMENT '父级ID',
                                        `type` varchar(20) NOT NULL COMMENT '类型: COLLEGE-学院, MAJOR-专业, CLASS-班级',
                                        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='组织架构表';

    DROP TABLE IF EXISTS `sys_role`;
    CREATE TABLE `sys_role` (
                                `id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID',
                                `role_name` varchar(50) NOT NULL COMMENT '角色名称',
                                `role_code` varchar(50) NOT NULL COMMENT '角色代码(STUDENT, INSTRUCTOR, COORDINATOR, DIRECTOR, ADMIN)',
                                `description` varchar(200) DEFAULT NULL COMMENT '描述',
                                PRIMARY KEY (`id`),
                                UNIQUE KEY `uk_role_code` (`role_code`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统角色表';

    DROP TABLE IF EXISTS `sys_user`;
    CREATE TABLE `sys_user` (
                                `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
                                `username` varchar(50) NOT NULL COMMENT '登录账号(学工号)',
                                `password` varchar(100) NOT NULL COMMENT '加密密码',
                                `real_name` varchar(50) NOT NULL COMMENT '真实姓名',
                                `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
                                `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
                                `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态: 0-禁用, 1-启用',
                                `org_id` bigint DEFAULT NULL COMMENT '所属组织ID(学院/专业/行政班)',
                                `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                PRIMARY KEY (`id`),
                                UNIQUE KEY `uk_username` (`username`),
                                CONSTRAINT `fk_user_org` FOREIGN KEY (`org_id`) REFERENCES `sys_organization` (`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';

    DROP TABLE IF EXISTS `sys_user_role`;
    CREATE TABLE `sys_user_role` (
                                     `user_id` bigint NOT NULL COMMENT '用户ID',
                                     `role_id` bigint NOT NULL COMMENT '角色ID',
                                     PRIMARY KEY (`user_id`,`role_id`),
                                     CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE,
                                     CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表(支持多角色兼任)';

    -- ---------------------------------------------------------------------------------
    -- 2. 行政班级与学生关联表
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `class_info`;
    CREATE TABLE `class_info` (
                                  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '班级ID',
                                  `class_name` varchar(100) NOT NULL COMMENT '班级名称',
                                  `major_id` bigint NOT NULL COMMENT '所属专业ID',
                                  `grade` int NOT NULL COMMENT '年级(如2024)',
                                  PRIMARY KEY (`id`),
                                  CONSTRAINT `fk_class_major` FOREIGN KEY (`major_id`) REFERENCES `sys_organization` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行政班级信息表';

    DROP TABLE IF EXISTS `student_info`;
    CREATE TABLE `student_info` (
                                    `user_id` bigint NOT NULL COMMENT '关联用户ID',
                                    `student_no` varchar(30) NOT NULL COMMENT '学号',
                                    `class_id` bigint NOT NULL COMMENT '行政班级ID',
                                    PRIMARY KEY (`user_id`),
                                    UNIQUE KEY `uk_student_no` (`student_no`),
                                    CONSTRAINT `fk_student_class` FOREIGN KEY (`class_id`) REFERENCES `class_info` (`id`) ON DELETE CASCADE,
                                    CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生拓展信息表';

    -- ---------------------------------------------------------------------------------
    -- 3. 人才培养方案管理 (专业负责人权限)
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `program_scheme`;
    CREATE TABLE `program_scheme` (
                                      `id` bigint NOT NULL AUTO_INCREMENT COMMENT '方案ID',
                                      `major_id` bigint NOT NULL COMMENT '专业ID',
                                      `version_name` varchar(100) NOT NULL COMMENT '版本名称(如2024版人才培养方案)',
                                      `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态: 0-草稿, 1-发布启用, 2-历史归档',
                                      `created_by` bigint DEFAULT NULL COMMENT '创建人ID',
                                      `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                      PRIMARY KEY (`id`),
                                      CONSTRAINT `fk_scheme_major` FOREIGN KEY (`major_id`) REFERENCES `sys_organization` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人才培养方案表';

    DROP TABLE IF EXISTS `grad_requirement`;
    CREATE TABLE `grad_requirement` (
                                        `id` bigint NOT NULL AUTO_INCREMENT COMMENT '毕业要求ID',
                                        `scheme_id` bigint NOT NULL COMMENT '培养方案ID',
                                        `code` varchar(20) NOT NULL COMMENT '编码(如 GR1, GR2)',
                                        `title` varchar(100) NOT NULL COMMENT '标题(如 工程知识)',
                                        `content` text NOT NULL COMMENT '毕业要求具体描述',
                                        PRIMARY KEY (`id`),
                                        CONSTRAINT `fk_gr_scheme` FOREIGN KEY (`scheme_id`) REFERENCES `program_scheme` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕业要求大项表(12条基本标准)';

    DROP TABLE IF EXISTS `grad_indicator_point`;
    CREATE TABLE `grad_indicator_point` (
                                            `id` bigint NOT NULL AUTO_INCREMENT COMMENT '指标点ID',
                                            `req_id` bigint NOT NULL COMMENT '所属毕业要求ID',
                                            `code` varchar(20) NOT NULL COMMENT '指标点编码(如 1.1, 1.2)',
                                            `content` text NOT NULL COMMENT '指标点具体拆解描述',
                                            PRIMARY KEY (`id`),
                                            CONSTRAINT `fk_ip_req` FOREIGN KEY (`req_id`) REFERENCES `grad_requirement` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕业要求二级指标点表';

    -- ---------------------------------------------------------------------------------
    -- 4. 课程管理与大纲设计 (课程负责人权限)
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `course`;
    CREATE TABLE `course` (
                              `id` bigint NOT NULL AUTO_INCREMENT COMMENT '课程ID',
                              `course_code` varchar(50) NOT NULL COMMENT '课程代码',
                              `course_name` varchar(100) NOT NULL COMMENT '课程名称',
                              `credits` decimal(3,1) NOT NULL COMMENT '学分',
                              `hours` int NOT NULL COMMENT '总学时',
                              `scheme_id` bigint NOT NULL COMMENT '关联培养方案ID',
                              PRIMARY KEY (`id`),
                              UNIQUE KEY `uk_course_code` (`course_code`),
                              CONSTRAINT `fk_course_scheme` FOREIGN KEY (`scheme_id`) REFERENCES `program_scheme` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程信息表';

    DROP TABLE IF EXISTS `course_objective`;
    CREATE TABLE `course_objective` (
                                        `id` bigint NOT NULL AUTO_INCREMENT COMMENT '课程目标ID',
                                        `course_id` bigint NOT NULL COMMENT '课程ID',
                                        `objective_code` varchar(20) NOT NULL COMMENT '课程目标编码(如 CO1, CO2)',
                                        `content` text NOT NULL COMMENT '课程目标描述(可衡量动词表达)',
                                        PRIMARY KEY (`id`),
                                        CONSTRAINT `fk_co_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程目标表(1门课通常有3-5个课程目标)';

    DROP TABLE IF EXISTS `course_obj_indicator_map`;
    CREATE TABLE `course_obj_indicator_map` (
                                                `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                                `course_objective_id` bigint NOT NULL COMMENT '课程目标ID',
                                                `indicator_point_id` bigint NOT NULL COMMENT '毕业要求指标点ID',
                                                `weight` decimal(3,2) NOT NULL COMMENT '支撑权重系数(0.01 - 1.00之间)',
                                                PRIMARY KEY (`id`),
                                                UNIQUE KEY `uk_co_indicator` (`course_objective_id`,`indicator_point_id`),
                                                CONSTRAINT `fk_map_co` FOREIGN KEY (`course_objective_id`) REFERENCES `course_objective` (`id`) ON DELETE CASCADE,
                                                CONSTRAINT `fk_map_ip` FOREIGN KEY (`indicator_point_id`) REFERENCES `grad_indicator_point` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程目标与毕业要求指标点支撑权重矩阵';

    -- ---------------------------------------------------------------------------------
    -- 5. 教学运行与排课
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `teaching_class`;
    CREATE TABLE `teaching_class` (
                                      `id` bigint NOT NULL AUTO_INCREMENT COMMENT '教学班ID',
                                      `course_id` bigint NOT NULL COMMENT '课程ID',
                                      `teacher_id` bigint NOT NULL COMMENT '任课教师ID',
                                      `semester` varchar(30) NOT NULL COMMENT '学期(如 2025-2026-1)',
                                      `class_name` varchar(100) NOT NULL COMMENT '教学班名称(如 软件工程01班)',
                                      PRIMARY KEY (`id`),
                                      CONSTRAINT `fk_tc_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE,
                                      CONSTRAINT `fk_tc_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排课/教学班运行信息表';

    DROP TABLE IF EXISTS `teaching_class_student`;
    CREATE TABLE `teaching_class_student` (
                                              `teaching_class_id` bigint NOT NULL COMMENT '教学班ID',
                                              `student_id` bigint NOT NULL COMMENT '学生ID(sys_user.id)',
                                              PRIMARY KEY (`teaching_class_id`,`student_id`),
                                              CONSTRAINT `fk_tcs_student` FOREIGN KEY (`student_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
                                              CONSTRAINT `fk_tcs_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教学班选课学生关联表';

    -- ---------------------------------------------------------------------------------
    -- 6. 课程考核、标准与学生得分 (核心计算数据源，授课教师录入)
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `assessment_method`;
    CREATE TABLE `assessment_method` (
                                         `id` bigint NOT NULL AUTO_INCREMENT COMMENT '考核方法ID',
                                         `course_id` bigint NOT NULL COMMENT '课程ID',
                                         `name` varchar(50) NOT NULL COMMENT '考核项名称(如 期末考试, 课程实验, 平时作业)',
                                         `weight` decimal(3,2) NOT NULL COMMENT '考核占比权重(如 0.60, 0.20, 0.20)',
                                         PRIMARY KEY (`id`),
                                         CONSTRAINT `fk_am_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程考核评价方式表';

    DROP TABLE IF EXISTS `assessment_item`;
    CREATE TABLE `assessment_item` (
                                       `id` bigint NOT NULL AUTO_INCREMENT COMMENT '评价指标细项ID',
                                       `method_id` bigint NOT NULL COMMENT '关联考核方法ID',
                                       `name` varchar(100) NOT NULL COMMENT '小项名称(如 试卷大题1, 实验报告1, 作业1)',
                                       `max_score` decimal(5,2) NOT NULL COMMENT '考核小项满分',
                                       `course_objective_id` bigint NOT NULL COMMENT '强绑定的唯一课程目标ID(OBE核心！)',
                                       PRIMARY KEY (`id`),
                                       CONSTRAINT `fk_ai_co` FOREIGN KEY (`course_objective_id`) REFERENCES `course_objective` (`id`) ON DELETE CASCADE,
                                       CONSTRAINT `fk_ai_method` FOREIGN KEY (`method_id`) REFERENCES `assessment_method` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程考核细小项表(绑定课程目标)';

    DROP TABLE IF EXISTS `student_score`;
    CREATE TABLE `student_score` (
                                     `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                     `student_id` bigint NOT NULL COMMENT '学生用户ID(sys_user.id)',
                                     `assessment_item_id` bigint NOT NULL COMMENT '考核细项ID',
                                     `actual_score` decimal(5,2) NOT NULL COMMENT '实际得分',
                                     PRIMARY KEY (`id`),
                                     UNIQUE KEY `uk_student_item_score` (`student_id`,`assessment_item_id`),
                                     CONSTRAINT `fk_score_item` FOREIGN KEY (`assessment_item_id`) REFERENCES `assessment_item` (`id`) ON DELETE CASCADE,
                                     CONSTRAINT `fk_score_student` FOREIGN KEY (`student_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生得分明细表(成绩与达成度计算引擎数据源)';

    -- ---------------------------------------------------------------------------------
    -- 7. 佐证材料归档模块 (授课教师权限)
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `evidence_material`;
    CREATE TABLE `evidence_material` (
                                         `id` bigint NOT NULL AUTO_INCREMENT COMMENT '佐证材料ID',
                                         `teaching_class_id` bigint NOT NULL COMMENT '教学班级ID',
                                         `assessment_method_id` bigint NOT NULL COMMENT '对应的考核模块ID',
                                         `file_name` varchar(255) NOT NULL COMMENT '归档文件名',
                                         `file_path` varchar(512) NOT NULL COMMENT 'OSS/本地文件存储路径',
                                         `level_tag` varchar(20) NOT NULL COMMENT '样本档次: HIGH-优秀, MEDIUM-中等, LOW-不及格',
                                         `uploaded_by` bigint DEFAULT NULL COMMENT '上传教师ID',
                                         `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
                                         PRIMARY KEY (`id`),
                                         CONSTRAINT `fk_ev_method` FOREIGN KEY (`assessment_method_id`) REFERENCES `assessment_method` (`id`) ON DELETE CASCADE,
                                         CONSTRAINT `fk_ev_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='认证佐证材料样本归档表';

    -- ---------------------------------------------------------------------------------
    -- 8. 达成度计算结果与持续改进模块 (计算引擎生成与教师撰写)
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `course_attainment`;
    CREATE TABLE `course_attainment` (
                                         `id` bigint NOT NULL AUTO_INCREMENT COMMENT '达成度计算结果ID',
                                         `teaching_class_id` bigint NOT NULL COMMENT '教学班ID',
                                         `course_objective_id` bigint NOT NULL COMMENT '课程目标ID',
                                         `attainment_val` decimal(4,3) NOT NULL COMMENT '直接达成度实测值(0.000 - 1.000)',
                                         `calculated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '计算生成时间',
                                         PRIMARY KEY (`id`),
                                         UNIQUE KEY `uk_tc_co_attainment` (`teaching_class_id`,`course_objective_id`),
                                         CONSTRAINT `fk_att_co` FOREIGN KEY (`course_objective_id`) REFERENCES `course_objective` (`id`) ON DELETE CASCADE,
                                         CONSTRAINT `fk_att_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教学班课程目标达成度直接评价计算结果表';

    DROP TABLE IF EXISTS `continuous_improvement`;
    CREATE TABLE `continuous_improvement` (
                                              `id` bigint NOT NULL AUTO_INCREMENT COMMENT '持续改进记录ID',
                                              `teaching_class_id` bigint NOT NULL COMMENT '教学班级ID',
                                              `problem_analysis` text NOT NULL COMMENT '原因与达成度不足分析',
                                              `improvement_measures` text NOT NULL COMMENT '下一步针对性教学改进措施',
                                              `created_by` bigint NOT NULL COMMENT '任课教师ID',
                                              `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立时间',
                                              PRIMARY KEY (`id`),
                                              CONSTRAINT `fk_imp_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程教学班级质量持续改进分析报告';

    -- ---------------------------------------------------------------------------------
    -- 9. 调查与间接评价模块 (学生填写与负责人发布)
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `survey_questionnaire`;
    CREATE TABLE `survey_questionnaire` (
                                            `id` bigint NOT NULL AUTO_INCREMENT COMMENT '问卷ID',
                                            `title` varchar(150) NOT NULL COMMENT '问卷名称',
                                            `type` varchar(20) NOT NULL COMMENT '类型: STU_CO-学生课程目标达成问卷, GRADUATE-毕业生评价, EMPLOYER-用人单位评价',
                                            `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态: 0-关闭, 1-开放中',
                                            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
                                            PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='间接评价调查问卷表';

    DROP TABLE IF EXISTS `survey_answer`;
    CREATE TABLE `survey_answer` (
                                     `id` bigint NOT NULL AUTO_INCREMENT COMMENT '回答ID',
                                     `questionnaire_id` bigint NOT NULL COMMENT '问卷ID',
                                     `user_id` bigint DEFAULT NULL COMMENT '填写用户ID(可匿名，如果是校外匿名填报)',
                                     `raw_answers_json` text NOT NULL COMMENT '问卷题目与反馈内容JSON数据',
                                     `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
                                     PRIMARY KEY (`id`),
                                     CONSTRAINT `fk_sa_q` FOREIGN KEY (`questionnaire_id`) REFERENCES `survey_questionnaire` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷答卷反馈表';

    -- ---------------------------------------------------------------------------------
    -- 10. 自评报告协同模块 (专业负责人统筹，多人协同编写)
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `report`;
    CREATE TABLE `report` (
                              `id` bigint NOT NULL AUTO_INCREMENT COMMENT '报告ID',
                              `scheme_id` bigint NOT NULL COMMENT '关联培养方案ID',
                              `title` varchar(200) NOT NULL COMMENT '报告标题',
                              `version` varchar(30) NOT NULL COMMENT '版本号(如 V1.0, V2.0)',
                              `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态: 0-编写中, 1-审核中, 2-已完成, 3-已归档',
                              `created_by` bigint NOT NULL COMMENT '创建人(专业负责人)',
                              `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                              `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
                              PRIMARY KEY (`id`),
                              CONSTRAINT `fk_report_scheme` FOREIGN KEY (`scheme_id`) REFERENCES `program_scheme` (`id`) ON DELETE RESTRICT,
                              CONSTRAINT `fk_report_creator` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自评报告主表';

    DROP TABLE IF EXISTS `report_section`;
    CREATE TABLE `report_section` (
                                      `id` bigint NOT NULL AUTO_INCREMENT COMMENT '章节ID',
                                      `report_id` bigint NOT NULL COMMENT '所属报告ID',
                                      `section_code` varchar(20) NOT NULL COMMENT '章节编号(如 1.1, 1.2, 2.1)',
                                      `title` varchar(200) NOT NULL COMMENT '章节标题',
                                      `content` longtext COMMENT '章节正文内容',
                                      `status` tinyint NOT NULL DEFAULT '0' COMMENT '完成状态: 0-未开始, 1-编写中, 2-已完成',
                                      `assigned_to` bigint DEFAULT NULL COMMENT '负责人ID',
                                      `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后修改时间',
                                      PRIMARY KEY (`id`),
                                      CONSTRAINT `fk_section_report` FOREIGN KEY (`report_id`) REFERENCES `report` (`id`) ON DELETE CASCADE,
                                      CONSTRAINT `fk_section_user` FOREIGN KEY (`assigned_to`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自评报告章节表';

    DROP TABLE IF EXISTS `report_data_source`;
    CREATE TABLE `report_data_source` (
                                          `id` bigint NOT NULL AUTO_INCREMENT COMMENT '数据源ID',
                                          `section_id` bigint NOT NULL COMMENT '所属章节ID',
                                          `source_type` varchar(30) NOT NULL COMMENT '来源类型: ATTAINMENT-达成度, SURVEY-问卷, TABLE-数据表格, CHART-图表',
                                          `source_key` varchar(100) NOT NULL COMMENT '数据来源标识',
                                          `auto_fill_config` text COMMENT '自动填充JSON配置',
                                          PRIMARY KEY (`id`),
                                          CONSTRAINT `fk_rds_section` FOREIGN KEY (`section_id`) REFERENCES `report_section` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报告章节数据自动填充配置表';

    -- ---------------------------------------------------------------------------------
    -- 11. 系统审计日志 (系统管理员安全审计)
    -- ---------------------------------------------------------------------------------
    DROP TABLE IF EXISTS `sys_audit_log`;
    CREATE TABLE `sys_audit_log` (
                                     `id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
                                     `user_id` bigint DEFAULT NULL COMMENT '操作用户ID',
                                     `username` varchar(50) DEFAULT NULL COMMENT '操作账号(冗余，防止用户被删后日志丢失)',
                                     `action` varchar(50) NOT NULL COMMENT '操作类型: LOGIN, CREATE, UPDATE, DELETE, EXPORT',
                                     `target` varchar(100) DEFAULT NULL COMMENT '操作对象(如表名或功能模块)',
                                     `target_id` bigint DEFAULT NULL COMMENT '操作对象ID',
                                     `detail` varchar(500) DEFAULT NULL COMMENT '操作详情',
                                     `ip_address` varchar(45) DEFAULT NULL COMMENT '客户端IP',
                                     `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
                                     PRIMARY KEY (`id`),
                                     INDEX `idx_audit_user` (`user_id`),
                                     INDEX `idx_audit_time` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统操作审计日志表';

    SET FOREIGN_KEY_CHECKS = 1;


    -- =================================================================================
    -- 💡 初始演练/测试数据填充区
    -- =================================================================================

    -- 1. 初始化组织机构
    INSERT INTO `sys_organization` (`id`, `name`, `parent_id`, `type`) VALUES
                                                                           (1, '信息与软件工程学院', NULL, 'COLLEGE'),
                                                                           (2, '软件工程专业', 1, 'MAJOR'),
                                                                           (3, '软件工程2024级1班', 2, 'CLASS');

    -- 2. 初始化角色 (5大角色)
    INSERT INTO `sys_role` (`id`, `role_name`, `role_code`, `description`) VALUES
                                                                               (1, '系统管理员', 'ADMIN', '负责整个认证系统的数据同步与运维底座管理'),
                                                                               (2, '专业负责人', 'DIRECTOR', '负责培养方案、毕业要求拆解及全专业达成度驾驶舱'),
                                                                               (3, '课程负责人', 'COORDINATOR', '负责课程大纲、目标与考核方案的设计规划'),
                                                                               (4, '授课教师', 'INSTRUCTOR', '负责一线的物理教学班成绩分维度录入和改进撰写'),
                                                                               (5, '学生', 'STUDENT', '查看个人课程大纲、OBE成绩雷达图以及填写间接问卷');

    -- 3. 初始化用户
    -- 默认所有用户初始密码的明文为 '123456' (实际项目中使用 Spring Security 搭配 BCrypt 加密存储)
    INSERT INTO `sys_user` (`id`, `username`, `password`, `real_name`, `email`, `phone`, `status`, `org_id`) VALUES
                                                                                                                 (100, 'admin', '$2a$10$R7Y3uM9A7Z98zIuPzG7B8O3E6W/mR70r...dummy', '系统管理员(张安全)', 'admin@edu.cn', '13800000000', 1, 1),
                                                                                                                 (101, 'prof_wang', '$2a$10$R7Y3uM9A7Z98zIuPzG7B8O3E6W/mR70r...dummy', '王教授(专业负责人)', 'wang_prof@edu.cn', '13800000001', 1, 2),
                                                                                                                 (102, 'dr_li', '$2a$10$R7Y3uM9A7Z98zIuPzG7B8O3E6W/mR70r...dummy', '李博士(课程负责人)', 'li_doc@edu.cn', '13800000002', 1, 2),
                                                                                                                 (103, 'teacher_zhang', '$2a$10$R7Y3uM9A7Z98zIuPzG7B8O3E6W/mR70r...dummy', '张老师(授课教师)', 'zhang_t@edu.cn', '13800000003', 1, 2),
                                                                                                                 (201, 'stu_xiaoming', '$2a$10$R7Y3uM9A7Z98zIuPzG7B8O3E6W/mR70r...dummy', '小明(学生)', 'xiaoming@edu.cn', '13899999999', 1, 3);

    -- 4. 绑定多角色关联 (由于部分老师可能既教书又当负责人，多角色表能完美支撑此场景)
    INSERT INTO `sys_user_role` (`user_id`, `role_id`) VALUES
                                                           (100, 1), -- admin 是管理员
                                                           (101, 2), -- 王教授是专业负责人
                                                           (102, 3), -- 李博士是课程负责人
                                                           (103, 4), -- 张老师是授课教师
                                                           (201, 5); -- 小明是学生

    -- 5. 行政班级与学生信息绑定
    INSERT INTO `class_info` (`id`, `class_name`, `major_id`, `grade`) VALUES (1, '软件工程2024级1班', 2, 2024);
    INSERT INTO `student_info` (`user_id`, `student_no`, `class_id`) VALUES (201, '20240801001', 1);

    -- 6. 2024版软件工程培养方案及毕业要求指标点配置
    INSERT INTO `program_scheme` (`id`, `major_id`, `version_name`, `status`, `created_by`) VALUES
        (1, 2, '2024版软件工程培养方案', 1, 101);

    -- 拆分并插入 12 条毕业要求中的部分重点要求
    INSERT INTO `grad_requirement` (`id`, `scheme_id`, `code`, `title`, `content`) VALUES
                                                                                       (1, 1, 'GR1', '工程知识', '能够将数学、自然科学、工程基础和专业知识用于解决软件领域的复杂工程问题。'),
                                                                                       (2, 1, 'GR2', '问题分析', '能够应用数学、自然科学和工程科学的基本原理，识别、表达、并通过文献研究分析软件领域的复杂工程问题，以获得有效结论。'),
                                                                                       (3, 1, 'GR3', '设计/开发解决方案', '能够设计针对软件领域复杂工程问题的解决方案，设计满足特定需求的软件系统、算法架构或模块。');

    -- 二级指标点拆解
    INSERT INTO `grad_indicator_point` (`id`, `req_id`, `code`, `content`) VALUES
                                                                               (1, 1, '1.1', '能将数学、自然科学、工程基础等知识用于软件工程问题的建模和公式推导。'),
                                                                               (2, 2, '2.1', '能运用软件科学原理，识别并规范表达复杂软件工程问题的关键制约环节与科学问题。'),
                                                                               (3, 3, '3.1', '能够完成软件系统的整体架构设计，并在系统设计中体现创新意识。');

    -- 7. 课程导入与《课程大纲》编制 (建立《软件工程》核心课)
    INSERT INTO `course` (`id`, `course_code`, `course_name`, `credits`, `hours`, `scheme_id`) VALUES
        (1, 'SE-302', '软件工程', 4.0, 64, 1);

    -- 制定《软件工程》的 3 项核心课程目标 (CO)
    INSERT INTO `course_objective` (`id`, `course_id`, `objective_code`, `content`) VALUES
                                                                                        (1, 1, 'CO1', '能够阐述软件生命周期及过程模型，并应用数学和工程知识为软件生命周期阶段性问题进行规范化建模。'),
                                                                                        (2, 1, 'CO2', '能够根据复杂软件项目的核心需求，运用软件工程分析方法 and 原理撰写规范的需求规格说明书。'),
                                                                                        (3, 1, 'CO3', '能够基于复杂软件系统方案，设计出具有可控复杂度的软件系统架构，并完成相应设计文档的编写与实施。');

    -- 构建《课程大纲-培养方案》支撑权重映射矩阵
    -- 即: 这门课程的目标 (CO) 分别支撑了培养方案里的哪些毕业要求指标点，支撑度(权重)是多少。
    INSERT INTO `course_obj_indicator_map` (`course_objective_id`, `indicator_point_id`, `weight`) VALUES
                                                                                                       (1, 1, 0.30), -- CO1 支撑 指标点 1.1，权重为 0.30
                                                                                                       (2, 2, 0.40), -- CO2 支撑 指标点 2.1，权重为 0.40
                                                                                                       (3, 3, 0.50); -- CO3 支撑 指标点 3.1，权重为 0.50

    -- 8. 教学运行与排课
    -- 将《软件工程》课程，在 2025-2026学年第一学期 派发教学班，由张老师(teacher_zhang)承担当期主讲。
    INSERT INTO `teaching_class` (`id`, `course_id`, `teacher_id`, `semester`, `class_name`) VALUES
        (1, 1, 103, '2025-2026-1', '软件工程01班(张老师班)');

    -- 将 小明 派入该教学班中听课
    INSERT INTO `teaching_class_student` (`teaching_class_id`, `student_id`) VALUES (1, 201);

    -- 9. 课程考核与标准细分设置 (考核Rubrics)
    -- 该课程设置 3 种评价方式：期末考试占 60%，课程实验占 20%，平时作业占 20%
    INSERT INTO `assessment_method` (`id`, `course_id`, `name`, `weight`) VALUES
                                                                              (1, 1, '期末考试', 0.60),
                                                                              (2, 1, '课程实验', 0.20),
                                                                              (3, 1, '平时作业', 0.20);

    -- 将试卷、作业、实验各个细项拆分出来，精准映射到特定课程目标(CO)
    INSERT INTO `assessment_item` (`id`, `method_id`, `name`, `max_score`, `course_objective_id`) VALUES
    -- 期末考试大题拆分
    (1, 1, '期末大试卷-第1题(软件过程与建模题)', 20.0, 1),  -- 指向 CO1
    (2, 1, '期末大试卷-第2题(需求分析规格书撰写题)', 40.0, 2), -- 指向 CO2
    (3, 1, '期末大试卷-第3题(软件架构设计与实现题)', 40.0, 3), -- 指向 CO3
    -- 课程实验项拆分
    (4, 2, '实验项目一(UML需求用例建模设计)', 50.0, 2),      -- 指向 CO2
    (5, 2, '实验项目二(MVC系统设计架构实验)', 50.0, 3),      -- 指向 CO3
    -- 平时作业
    (6, 3, '课后平时作业1(生命周期与建模练习)', 100.0, 1);    -- 指向 CO1

    -- 10. 录入学生平时与期末各项细微得分 (以小明同学为例)
    INSERT INTO `student_score` (`student_id`, `assessment_item_id`, `actual_score`) VALUES
                                                                                         (201, 1, 18.0), -- 试卷第1题 满分20, 得 18分
                                                                                         (201, 2, 32.0), -- 试卷第2题 满分40, 得 32分
                                                                                         (201, 3, 28.0), -- 试卷第3题 满分40, 得 28分
                                                                                         (201, 4, 45.0), -- 实验1 满分50, 得 45分
                                                                                         (201, 5, 40.0), -- 实验2 满分50, 得 40分
                                                                                         (201, 6, 85.0); -- 作业1 满分100, 得 85分

    -- 11. 自评报告协同编写示例
    INSERT INTO `report` (`id`, `scheme_id`, `title`, `version`, `status`, `created_by`) VALUES
        (1, 1, '2024版软件工程专业认证自评报告', 'V1.0', 0, 101);

    INSERT INTO `report_section` (`id`, `report_id`, `section_code`, `title`, `status`, `assigned_to`) VALUES
        (1, 1, '1.1', '专业基本情况概述', 2, 101),
        (2, 1, '1.2', '培养目标与毕业要求', 1, 102),
        (3, 1, '3.1', '课程体系对毕业要求的支撑', 0, NULL);