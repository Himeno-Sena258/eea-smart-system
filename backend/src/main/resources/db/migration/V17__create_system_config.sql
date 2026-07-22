CREATE TABLE IF NOT EXISTS `system_config` (
    `id` bigint NOT NULL DEFAULT 1 COMMENT '主键',
    `academic_year` varchar(20) NOT NULL DEFAULT '2025-2026' COMMENT '当前学年',
    `semester` tinyint NOT NULL DEFAULT 1 COMMENT '当前学期',
    `attainment_threshold` decimal(4,3) NOT NULL DEFAULT 0.680 COMMENT '达成度阈值',
    `certification_standard` varchar(200) NOT NULL DEFAULT '2024版工程教育认证标准' COMMENT '认证标准版本',
    `updated_by` bigint DEFAULT NULL COMMENT '更新人ID',
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

INSERT INTO `system_config` (`id`) VALUES (1)
ON DUPLICATE KEY UPDATE `id` = `id`;
