package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "班级 CO 达成度计算结果 VO")
public class TeacherCoAttainmentVO {
    @Schema(description = "课程目标ID")
    private Long coId;

    @Schema(description = "课程目标编码 (如 CO1, CO2)")
    private String coCode;

    @Schema(description = "课程目标描述")
    private String coDescription;

    @Schema(description = "支撑的毕业要求二级指标点")
    private String indicatorPointCode;

    @Schema(description = "目标满分")
    private BigDecimal targetMaxScore;

    @Schema(description = "班级平均得分")
    private BigDecimal classAvgScore;

    @Schema(description = "直接达成度实测值 A(COk) (0.000 - 1.000)")
    private BigDecimal attainmentVal;

    @Schema(description = "达标警戒线 (标准值 0.680)")
    private BigDecimal warningThreshold;

    @Schema(description = "是否达标 (1-达标, 0-预警/未达标)")
    private Integer isQualified;
}
