package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "毕业要求与拆解指标点 VO")
public class GradRequirementVO {
    @Schema(description = "毕业要求ID")
    private Long id;

    @Schema(description = "培养方案ID")
    private Long schemeId;

    @Schema(description = "毕业要求代码 (如 1, 2, 3)")
    private String reqCode;

    @Schema(description = "毕业要求大项标题 (如 工程知识、问题分析)")
    private String title;

    @Schema(description = "毕业要求详细内涵")
    private String content;

    @Schema(description = "包含的二级指标点列表")
    private List<GradIndicatorPointVO> indicatorPoints;

    @Data
    @Schema(description = "二级指标点 VO")
    public static class GradIndicatorPointVO {
        @Schema(description = "指标点ID")
        private Long id;

        @Schema(description = "所属毕业要求ID")
        private Long reqId;

        @Schema(description = "指标点编码 (如 1.1, 1.2)")
        private String code;

        @Schema(description = "指标点拆解内涵")
        private String content;

        @Schema(description = "支撑本指标点的课程数")
        private Integer supportingCourseCount;
    }
}
