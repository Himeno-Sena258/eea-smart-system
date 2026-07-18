package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "新增/更新考核细项并强绑定课程目标 (CO) DTO")
public class SaveItemDTO {

    @Schema(description = "考核细项ID (修改时传入，新增留空)")
    private Long id;

    @Schema(description = "关联考核方式ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long methodId;

    @Schema(description = "细项名称 (如 试卷大题1, 实验报告1, 作业1)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "细项满分 (如 20.0)", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal maxScore;

    @Schema(description = "强绑定的课程目标ID (CO1~CO5)", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long courseObjectiveId;
}
