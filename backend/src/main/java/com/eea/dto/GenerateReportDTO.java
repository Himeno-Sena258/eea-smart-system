package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "自评报告生成导出 DTO")
public class GenerateReportDTO {

    @Schema(description = "培养方案ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long schemeId;

    @Schema(description = "自评报告标题", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @Schema(description = "版本号 (如 V1.0)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String version;
}
