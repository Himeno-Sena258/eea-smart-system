package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "课程目标 (CO1~CO5) 制定 VO")
public class CourseObjectiveVO {

    @Schema(description = "课程目标ID")
    private Long id;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "课程目标编码 (如 CO1, CO2)")
    private String objectiveCode;

    @Schema(description = "课程目标详细描述 (可衡量动词表达)")
    private String content;

    @Schema(description = "支撑的二级指标点ID列表")
    private List<Long> indicatorPointIds;

    @Schema(description = "支撑的二级指标点编码列表 (如 1.1, 2.1)")
    private List<String> indicatorPointCodes;
}
