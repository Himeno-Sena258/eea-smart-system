
# DROP DATABASE IF EXISTS obe_system;
# CREATE DATABASE obe_system DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `obe_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `obe_system`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------------
-- 1. 系统与RBAC权限模块
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
    `avatar_url` varchar(500) DEFAULT NULL COMMENT '头像地址',
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
-- 3. 人才培养方案管理
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
    `code` varchar(20) NOT NULL COMMENT '编码(如GR1, GR2)',
    `title` varchar(100) NOT NULL COMMENT '标题(如工程知识)',
    `content` text NOT NULL COMMENT '毕业要求具体描述',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_gr_scheme` FOREIGN KEY (`scheme_id`) REFERENCES `program_scheme` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕业要求大项表(12条基本标准)';

DROP TABLE IF EXISTS `grad_indicator_point`;
CREATE TABLE `grad_indicator_point` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '指标点ID',
    `req_id` bigint NOT NULL COMMENT '所属毕业要求ID',
    `code` varchar(20) NOT NULL COMMENT '指标点编码(如1.1, 1.2)',
    `content` text NOT NULL COMMENT '指标点具体拆解描述',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_ip_req` FOREIGN KEY (`req_id`) REFERENCES `grad_requirement` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕业要求二级指标点表';

-- ---------------------------------------------------------------------------------
-- 4. 课程管理与大纲设计
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
    `objective_code` varchar(20) NOT NULL COMMENT '课程目标编码(如CO1, CO2)',
    `content` text NOT NULL COMMENT '课程目标描述(可量行动词表达)',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_co_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程目标表(1门课通常有3-5个课程目标)';

DROP TABLE IF EXISTS `course_obj_indicator_map`;
CREATE TABLE `course_obj_indicator_map` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `course_objective_id` bigint NOT NULL COMMENT '课程目标ID',
    `indicator_point_id` bigint NOT NULL COMMENT '毕业要求指标点ID',
    `weight` decimal(4,3) NOT NULL COMMENT '支撑权重系数(0.001 - 1.000之间)',
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
    `semester` varchar(30) NOT NULL COMMENT '学期(如2025-2026-1)',
    `class_name` varchar(100) NOT NULL COMMENT '教学班名称(如软件工程01班)',
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
-- 6. 课程考核、标准与学生得分
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS `assessment_method`;
CREATE TABLE `assessment_method` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '考核方法ID',
    `course_id` bigint NOT NULL COMMENT '课程ID',
    `name` varchar(50) NOT NULL COMMENT '考核项名称(如期末考试, 课程实验, 平时作业)',
    `weight` decimal(3,2) NOT NULL COMMENT '考核占比权重(如0.60, 0.20, 0.20)',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_am_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程考核评价方式表';

DROP TABLE IF EXISTS `assessment_item`;
CREATE TABLE `assessment_item` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '评价指标细项ID',
    `method_id` bigint NOT NULL COMMENT '关联考核方法ID',
    `name` varchar(100) NOT NULL COMMENT '小项名称(如试卷大题1, 实验报告1, 作业1)',
    `max_score` decimal(5,2) NOT NULL COMMENT '考核小项满分',
    `course_objective_id` bigint NOT NULL COMMENT '绑定的唯一课程目标ID(OBE核心)',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_ai_co` FOREIGN KEY (`course_objective_id`) REFERENCES `course_objective` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ai_method` FOREIGN KEY (`method_id`) REFERENCES `assessment_method` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程考核细项表(绑定课程目标)';

DROP TABLE IF EXISTS `assessment_standard`;
CREATE TABLE `assessment_standard` (
    `id` bigint PRIMARY KEY AUTO_INCREMENT,
    `assessment_item_id` bigint NOT NULL COMMENT '考核细项ID',
    `level` varchar(10) NOT NULL COMMENT '等级: A,B,C,D',
    `min_score` decimal(5,2) NOT NULL COMMENT '最低分',
    `max_score` decimal(5,2) NOT NULL COMMENT '最高分',
    `description` varchar(500) DEFAULT NULL COMMENT '等级描述',
    CONSTRAINT `fk_astd_item` FOREIGN KEY (`assessment_item_id`) REFERENCES `assessment_item` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考核评分标准表';

DROP TABLE IF EXISTS `student_score`;
CREATE TABLE `student_score` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `student_id` bigint NOT NULL COMMENT '学生用户ID(sys_user.id)',
    `teaching_class_id` bigint DEFAULT NULL COMMENT '教学班ID',
    `assessment_item_id` bigint NOT NULL COMMENT '考核细项ID',
    `actual_score` decimal(5,2) NOT NULL COMMENT '实际得分',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_item_score` (`student_id`,`assessment_item_id`),
    KEY `idx_tc_item` (`teaching_class_id`,`assessment_item_id`),
    CONSTRAINT `fk_score_item` FOREIGN KEY (`assessment_item_id`) REFERENCES `assessment_item` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_score_student` FOREIGN KEY (`student_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_score_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生得分明细表(成绩与达成度计算引擎数据源)';

-- ---------------------------------------------------------------------------------
-- 7. 佐证材料归档模块
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS `evidence_material`;
CREATE TABLE `evidence_material` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '佐证材料ID',
    `teaching_class_id` bigint NOT NULL COMMENT '教学班级ID',
    `assessment_method_id` bigint NOT NULL COMMENT '对应的考核模块ID',
    `file_name` varchar(255) NOT NULL COMMENT '归档文件名',
    `file_path` varchar(500) NOT NULL COMMENT 'OSS/本地文件存储路径',
    `level_tag` varchar(10) DEFAULT NULL COMMENT '样本档次: HIGH-优秀, MEDIUM-中等, LOW-不及格',
    `mime_type` varchar(100) DEFAULT NULL COMMENT 'MIME类型',
    `file_size` bigint DEFAULT NULL COMMENT '文件大小(字节)',
    `preview_url` varchar(500) DEFAULT NULL COMMENT '预览地址',
    `uploaded_by` bigint DEFAULT NULL COMMENT '上传教师ID',
    `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_em_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_em_method` FOREIGN KEY (`assessment_method_id`) REFERENCES `assessment_method` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='认证佐证材料样本归档表';

-- ---------------------------------------------------------------------------------
-- 8. 持续改进记录
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS `continuous_improvement`;
CREATE TABLE `continuous_improvement` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '持续改进记录ID',
    `teaching_class_id` bigint NOT NULL COMMENT '教学班级ID',
    `problem_analysis` text NOT NULL COMMENT '原因与达成度不足分析',
    `improvement_measures` text NOT NULL COMMENT '下一步针对性教学改进措施',
    `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态: 0-草稿, 1-已提交, 2-已审批, 3-退回',
    `reviewed_by` bigint DEFAULT NULL COMMENT '审批人ID',
    `reviewed_at` timestamp NULL DEFAULT NULL COMMENT '审批时间',
    `reviewer_comment` varchar(1000) DEFAULT NULL COMMENT '审批意见',
    `low_attainment_cos` varchar(500) DEFAULT NULL COMMENT '低达成度课程目标列表',
    `cycle_label` varchar(100) DEFAULT NULL COMMENT '改进周期标签',
    `follow_up_at` timestamp NULL DEFAULT NULL COMMENT '跟进整改截至日期',
    `follow_up_result` text COMMENT '跟进整改结果',
    `created_by` bigint NOT NULL COMMENT '任课教师ID',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '建立时间',
    `updated_at` timestamp NULL DEFAULT NULL COMMENT '最后修改时间',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_ci_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ci_creator` FOREIGN KEY (`created_by`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程教学班级质量持续改进分析报告';

-- ---------------------------------------------------------------------------------
-- 9. 课程达成度汇总
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS `course_attainment`;
CREATE TABLE `course_attainment` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '达成度计算结果ID',
    `teaching_class_id` bigint NOT NULL COMMENT '教学班ID',
    `course_objective_id` bigint NOT NULL COMMENT '课程目标ID',
    `attainment_val` decimal(4,3) NOT NULL COMMENT '直接达成度实测值(0.000 - 1.000)',
    `calculated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '计算生成时间',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_ca_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ca_co` FOREIGN KEY (`course_objective_id`) REFERENCES `course_objective` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教学班课程目标达成度直接评价计算结果表';

-- ---------------------------------------------------------------------------------
-- 10. 课程资源与教学内容
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS `course_resource`;
CREATE TABLE `course_resource` (
    `id` bigint PRIMARY KEY AUTO_INCREMENT,
    `course_id` bigint NOT NULL COMMENT '课程ID',
    `resource_type` varchar(30) NOT NULL COMMENT '类型: SYLLABUS,PPT,CASE,REFERENCE',
    `description` varchar(500) DEFAULT NULL COMMENT '资源描述',
    `file_name` varchar(255) NOT NULL COMMENT '文件名',
    `file_path` varchar(500) NOT NULL COMMENT '文件路径',
    `mime_type` varchar(100) DEFAULT NULL COMMENT 'MIME类型',
    `file_size` bigint DEFAULT NULL COMMENT '文件大小(字节)',
    `preview_url` varchar(500) DEFAULT NULL COMMENT '预览地址',
    `uploaded_by` bigint DEFAULT NULL COMMENT '上传人ID',
    `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    CONSTRAINT `fk_cr_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cr_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程资源表';

DROP TABLE IF EXISTS `course_teaching_content`;
CREATE TABLE `course_teaching_content` (
    `id` bigint PRIMARY KEY AUTO_INCREMENT,
    `course_id` bigint NOT NULL COMMENT '课程ID',
    `title` varchar(200) NOT NULL COMMENT '教学内容标题',
    `hours` int NOT NULL DEFAULT '0' COMMENT '学时',
    `objective_ids` varchar(200) DEFAULT NULL COMMENT '关联课程目标ID(JSON数组)',
    `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
    CONSTRAINT `fk_ctc_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教学内容表';

-- ---------------------------------------------------------------------------------
-- 11. 过程性记录
-- ---------------------------------------------------------------------------------
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
    KEY `idx_pr_tc_student` (`teaching_class_id`, `student_id`),
    CONSTRAINT `fk_pr_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pr_student` FOREIGN KEY (`student_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='过程性记录表';

-- ---------------------------------------------------------------------------------
-- 12. 调查问卷模块
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS `survey_questionnaire`;
CREATE TABLE `survey_questionnaire` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '问卷ID',
    `title` varchar(200) NOT NULL COMMENT '问卷名称',
    `type` varchar(30) NOT NULL COMMENT '类型: STU_CO-学生课程目标达成问卷, GRADUATE-毕业生评价, EMPLOYER-用人单位评价',
    `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态: 0-关闭, 1-开放中',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='间接评价调查问卷表';

DROP TABLE IF EXISTS `survey_question`;
CREATE TABLE `survey_question` (
    `id` bigint PRIMARY KEY AUTO_INCREMENT,
    `questionnaire_id` bigint NOT NULL COMMENT '所属问卷ID',
    `question_code` varchar(20) NOT NULL COMMENT '题目编码',
    `title` varchar(300) NOT NULL COMMENT '题目内容',
    `question_type` varchar(30) NOT NULL DEFAULT 'SCORE' COMMENT '题目类型',
    `options` text DEFAULT NULL COMMENT '选项配置(JSON数组)',
    `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序',
    CONSTRAINT `fk_sq_questionnaire` FOREIGN KEY (`questionnaire_id`) REFERENCES `survey_questionnaire` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷题目表';

DROP TABLE IF EXISTS `survey_answer`;
CREATE TABLE `survey_answer` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '回答ID',
    `questionnaire_id` bigint NOT NULL COMMENT '问卷ID',
    `user_id` bigint DEFAULT NULL COMMENT '填写用户ID(可匿名，如果是校外匿名填表)',
    `raw_answers_json` text NOT NULL COMMENT '问卷题目与反馈内容JSON数据',
    `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_sa_q` FOREIGN KEY (`questionnaire_id`) REFERENCES `survey_questionnaire` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='问卷答卷反馈表';

-- ---------------------------------------------------------------------------------
-- 13. 自评报告协同模块
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS `report`;
CREATE TABLE `report` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '报告ID',
    `scheme_id` bigint NOT NULL COMMENT '关联培养方案ID',
    `title` varchar(200) NOT NULL COMMENT '报告标题',
    `version` varchar(30) NOT NULL COMMENT '版本号(如V1.0, V2.0)',
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
    `section_code` varchar(20) NOT NULL COMMENT '章节编号(如1.1, 1.2, 2.1)',
    `title` varchar(200) NOT NULL COMMENT '章节标题',
    `content` longtext COMMENT '章节正文内容',
    `status` tinyint NOT NULL DEFAULT '0' COMMENT '完成状态: 0-未开始, 1-编写中, 2-已完成',
    `assigned_to` bigint DEFAULT NULL COMMENT '负责人ID',
    `due_at` timestamp NULL DEFAULT NULL COMMENT '截止时间',
    `submitted_at` timestamp NULL DEFAULT NULL COMMENT '提交时间',
    `reviewed_by` bigint DEFAULT NULL COMMENT '审阅人ID',
    `reviewed_at` timestamp NULL DEFAULT NULL COMMENT '审阅时间',
    `review_comment` varchar(1000) DEFAULT NULL COMMENT '审阅意见',
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
-- 14. 毕业要求达成度汇总
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS `grad_indicator_attainment`;
CREATE TABLE `grad_indicator_attainment` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `scheme_id` bigint NOT NULL COMMENT '培养方案ID',
    `grade` int NOT NULL COMMENT '年级(如2024)',
    `indicator_point_id` bigint NOT NULL COMMENT '二级指标点ID',
    `attainment_val` decimal(4,3) NOT NULL COMMENT '直接达成度实测值(0.000 - 1.000)',
    `calculated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '统计生成时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_scheme_grade_ip` (`scheme_id`, `grade`, `indicator_point_id`),
    CONSTRAINT `fk_gia_scheme` FOREIGN KEY (`scheme_id`) REFERENCES `program_scheme` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_gia_ip` FOREIGN KEY (`indicator_point_id`) REFERENCES `grad_indicator_point` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕业要求二级指标点达成度结果表';

DROP TABLE IF EXISTS `grad_requirement_attainment`;
CREATE TABLE `grad_requirement_attainment` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `scheme_id` bigint NOT NULL COMMENT '培养方案ID',
    `grade` int NOT NULL COMMENT '年级(如2024)',
    `req_id` bigint NOT NULL COMMENT '毕业要求大项ID',
    `attainment_val` decimal(4,3) NOT NULL COMMENT '达成度数值(0.000 - 1.000)',
    `calculated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '统计生成时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_scheme_grade_req` (`scheme_id`, `grade`, `req_id`),
    CONSTRAINT `fk_gra_scheme` FOREIGN KEY (`scheme_id`) REFERENCES `program_scheme` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_gra_req` FOREIGN KEY (`req_id`) REFERENCES `grad_requirement` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毕业要求一级大项达成度结果表';

-- ---------------------------------------------------------------------------------
-- 15. 学生课程总评成绩
-- ---------------------------------------------------------------------------------
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
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_student_tc` (`student_id`, `teaching_class_id`),
    CONSTRAINT `fk_scs_student` FOREIGN KEY (`student_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_scs_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_scs_tc` FOREIGN KEY (`teaching_class_id`) REFERENCES `teaching_class` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生综合总评成绩单';

-- ---------------------------------------------------------------------------------
-- 16. 系统审计日志
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS `sys_audit_log`;
CREATE TABLE `sys_audit_log` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `user_id` bigint DEFAULT NULL COMMENT '操作用户ID',
    `username` varchar(50) DEFAULT NULL COMMENT '操作账号(冗余，防止用户被删后日志丢失)',
    `action` varchar(50) NOT NULL COMMENT '操作类型: LOGIN, CREATE, UPDATE, DELETE, EXPORT',
    `target` varchar(100) DEFAULT NULL COMMENT '操作对象(如表名或功能模块)',
    `target_id` bigint DEFAULT NULL COMMENT '操作对象ID',
    `detail` text DEFAULT NULL COMMENT '操作详情 JSON 或详细描述',
    `ip_address` varchar(45) DEFAULT NULL COMMENT '客户端IP',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (`id`),
    KEY `idx_audit_user` (`user_id`),
    KEY `idx_audit_time` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统操作审计日志表';

SET FOREIGN_KEY_CHECKS = 1;
