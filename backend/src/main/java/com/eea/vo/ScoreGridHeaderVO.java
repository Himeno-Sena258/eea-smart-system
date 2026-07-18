package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "细项成绩网格表头 VO")
public class ScoreGridHeaderVO {
    @Schema(description = "考核细项ID")
    private Long itemId;

    @Schema(description = "细项名称(如 试卷第1题, 实验1, 作业1)")
    private String itemName;

    @Schema(description = "细项满分")
    private BigDecimal maxScore;

    @Schema(description = "绑定课程目标ID")
    private Long coId;

    @Schema(description = "课程目标编码(如 CO1, CO2)")
    private String coCode;

    @Schema(description = "所属考核方式名称(如 期末考试, 课程实验, 平时作业)")
    private String methodName;

    @Schema(description = "考核方式占比权重(如 0.60)")
    private BigDecimal methodWeight;
}
