package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
@Schema(description = "OBE 课程矩阵与支撑权重配置 VO")
public class ObeMatrixVO {

    @Schema(description = "培养方案ID")
    private Long schemeId;

    @Schema(description = "培养方案名称")
    private String schemeName;

    @Schema(description = "适用年级")
    private Integer grade;

    @Schema(description = "矩阵列头: 全部的二级指标点列表")
    private List<GradRequirementVO.GradIndicatorPointVO> indicatorPoints;

    @Schema(description = "矩阵行数据: 课程及课程目标与指标点支撑权重")
    private List<ObeMatrixRowVO> rows;

    @Schema(description = "各指标点支撑权重累加和 Map (Key: indicatorPointId, Value: sumWeight)")
    private Map<Long, BigDecimal> weightSums;

    @Schema(description = "矩阵权重和校验是否全部通过 (必须全为 1.000)")
    private Boolean isMatrixValid;

    @Data
    @Schema(description = "矩阵行 (单门课程)")
    public static class ObeMatrixRowVO {
        @Schema(description = "课程ID")
        private Long courseId;

        @Schema(description = "课程代码")
        private String courseCode;

        @Schema(description = "课程名称")
        private String courseName;

        @Schema(description = "学分")
        private BigDecimal credits;

        @Schema(description = "该课程与指标点的权重映射列表")
        private List<ObeMatrixCellVO> cells;
    }

    @Data
    @Schema(description = "矩阵单元格 (CO -> IP -> Weight)")
    public static class ObeMatrixCellVO {
        @Schema(description = "课程目标ID")
        private Long courseObjectiveId;

        @Schema(description = "毕业要求指标点ID")
        private Long indicatorPointId;

        @Schema(description = "支撑权重 (0.01 - 1.00)")
        private BigDecimal weight;
    }
}
