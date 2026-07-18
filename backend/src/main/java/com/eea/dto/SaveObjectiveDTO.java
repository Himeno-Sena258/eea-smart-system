package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "新增/更新课程目标 (CO1~CO5) DTO")
public class SaveObjectiveDTO {

    @Schema(description = "课程目标ID (修改时传入，新增时留空)")
    private Long id;

    @Schema(description = "课程ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long courseId;

    @Schema(description = "课程目标编码 (如 CO1, CO2)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String objectiveCode;

    @Schema(description = "课程目标详细描述 (可衡量动词表达)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String content;

    @Schema(description = "关联支撑的二级指标点ID列表")
    private List<Long> indicatorPointIds;
}
