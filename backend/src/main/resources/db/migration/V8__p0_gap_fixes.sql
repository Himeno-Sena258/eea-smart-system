-- V8: P0 Gap List DB Fixes
-- continuous_improvement 审核状态字段
ALTER TABLE continuous_improvement
  ADD COLUMN status tinyint NOT NULL DEFAULT 1 COMMENT '0-草稿,1-已提交,2-已审阅,3-退回',
  ADD COLUMN reviewed_by bigint NULL,
  ADD COLUMN reviewed_at timestamp NULL,
  ADD COLUMN reviewer_comment varchar(1000) NULL,
  ADD COLUMN updated_at timestamp NULL,
  ADD COLUMN low_attainment_cos varchar(500) NULL,
  ADD COLUMN cycle_label varchar(100) NULL,
  ADD COLUMN follow_up_at timestamp NULL,
  ADD COLUMN follow_up_result text NULL;

-- report_section 截止/提交/审阅字段
ALTER TABLE report_section
  ADD COLUMN due_at timestamp NULL COMMENT '截止时间',
  ADD COLUMN submitted_at timestamp NULL,
  ADD COLUMN reviewed_by bigint NULL,
  ADD COLUMN reviewed_at timestamp NULL,
  ADD COLUMN review_comment varchar(1000) NULL;

-- sys_user 头像字段
ALTER TABLE sys_user
  ADD COLUMN avatar_url varchar(500) NULL COMMENT '头像地址';

-- evidence_material 预览元信息（course_resource 表尚未创建，暂不 ALTER）
ALTER TABLE evidence_material
  ADD COLUMN mime_type varchar(100) NULL,
  ADD COLUMN file_size bigint NULL,
  ADD COLUMN preview_url varchar(500) NULL;
