package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "班级教学改进反思提交 DTO")
public class SaveImprovementDTO {

    @Schema(description = "低达成度课程目标 (如 CO2, CO3)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String lowAttainmentCos;

    @Schema(description = "原因与达成度不足分析", requiredMode = Schema.RequiredMode.REQUIRED)
    private String problemAnalysis;

    @Schema(description = "拟采取的针对性教学改进措施", requiredMode = Schema.RequiredMode.REQUIRED)
    private String improvementMeasures;
}
