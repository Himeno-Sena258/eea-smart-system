-- V9: 前端剩余接入需求 - 新表
-- course_resource 课程资源表
DROP TABLE IF EXISTS course_resource;
CREATE TABLE course_resource (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    course_id bigint NOT NULL,
    resource_type varchar(30) NOT NULL COMMENT 'SYLLABUS,PPT,CASE,REFERENCE',
    description varchar(500) NULL,
    file_name varchar(255) NOT NULL,
    file_path varchar(500) NOT NULL,
    mime_type varchar(100) NULL,
    file_size bigint NULL,
    preview_url varchar(500) NULL,
    uploaded_by bigint NULL,
    uploaded_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- course_teaching_content 教学内容表
DROP TABLE IF EXISTS course_teaching_content;
CREATE TABLE course_teaching_content (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    course_id bigint NOT NULL,
    title varchar(200) NOT NULL,
    hours int NOT NULL DEFAULT 0,
    objective_ids varchar(200) NULL COMMENT '关联课程目标ID,JSON数组',
    sort_order int NOT NULL DEFAULT 0
);

-- assessment_standard 考核评分标准表
DROP TABLE IF EXISTS assessment_standard;
CREATE TABLE assessment_standard (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    assessment_item_id bigint NOT NULL,
    level varchar(10) NOT NULL COMMENT 'A,B,C,D',
    min_score decimal(5,2) NOT NULL,
    max_score decimal(5,2) NOT NULL,
    description varchar(500) NULL
);

-- survey_question 问卷题目表
DROP TABLE IF EXISTS survey_question;
CREATE TABLE survey_question (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    questionnaire_id bigint NOT NULL,
    question_code varchar(20) NOT NULL,
    title varchar(300) NOT NULL,
    question_type varchar(30) NOT NULL DEFAULT 'SCORE',
    options varchar(500) NULL COMMENT 'JSON数组',
    sort_order int NOT NULL DEFAULT 0
);
