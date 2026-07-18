package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "专业/年级级毕业达成度计算结果 VO")
public class DirectorAttainmentVO {

    @Schema(description = "二级指标点ID")
    private Long indicatorPointId;

    @Schema(description = "指标点编码 (如 1.1, 1.2)")
    private String indicatorPointCode;

    @Schema(description = "指标点拆解描述")
    private String indicatorPointContent;

    @Schema(description = "指标点权重总和 (标准值 1.000)")
    private BigDecimal weightSum;

    @Schema(description = "本指标点包含的课程达成度贡献拆解明细")
    private List<CourseAttainmentContributionVO> courseContributions;

    @Schema(description = "专业毕业达成度计算结果 Degree(IP_j) (0.000 - 1.000)")
    private BigDecimal attainmentVal;

    @Schema(description = "警戒线 (0.680)")
    private BigDecimal warningThreshold;

    @Schema(description = "是否达标 (1-达标, 0-预警)")
    private Integer isQualified;

    @Data
    @Schema(description = "单门课程对指标点的达成度贡献 VO")
    public static class CourseAttainmentContributionVO {
        @Schema(description = "课程ID")
        private Long courseId;

        @Schema(description = "课程名称")
        private String courseName;

        @Schema(description = "课程目标编码 (如 CO1)")
        private String coCode;

        @Schema(description = "支撑权重 W (如 0.200)")
        private BigDecimal weight;

        @Schema(description = "课程目标直接达成度实测值 A(CO) (如 0.785)")
        private BigDecimal coAttainmentVal;

        @Schema(description = "加权贡献值 W * A(CO)")
        private BigDecimal weightedContribution;
    }
}
