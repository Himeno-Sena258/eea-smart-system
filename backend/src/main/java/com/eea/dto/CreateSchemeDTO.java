package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "新建培养方案 DTO")
public class CreateSchemeDTO {

    @Schema(description = "专业ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long majorId;

    @Schema(description = "适用年级 (如 2024)", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer grade;

    @Schema(description = "方案名称 (如 2024版计算机科学与技术专业培养方案)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "总学分要求 (如 165.0)", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal totalCredits;
}
