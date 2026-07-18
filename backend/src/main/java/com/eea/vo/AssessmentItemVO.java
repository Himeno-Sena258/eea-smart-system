package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "考核细小项与 CO 绑定映射 VO")
public class AssessmentItemVO {

    @Schema(description = "评价指标细项ID")
    private Long id;

    @Schema(description = "关联考核方法ID")
    private Long methodId;

    @Schema(description = "考核环节名称 (期末考试, 课程实验, 平时作业)")
    private String methodName;

    @Schema(description = "细项名称 (如 试卷大题1, 实验报告1, 作业1)")
    private String name;

    @Schema(description = "考核细项满分")
    private BigDecimal maxScore;

    @Schema(description = "强绑定的课程目标ID (OBE核心！)")
    private Long courseObjectiveId;

    @Schema(description = "强绑定的课程目标编码 (如 CO1, CO2)")
    private String coCode;
}
