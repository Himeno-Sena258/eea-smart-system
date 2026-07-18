package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "考核环节占比权重 VO")
public class AssessmentMethodVO {

    @Schema(description = "考核方式ID")
    private Long id;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "考核项名称 (如 期末考试, 课程实验, 平时作业)")
    private String name;

    @Schema(description = "考核占比权重 (如 0.60, 0.20, 0.20)")
    private BigDecimal weight;
}
