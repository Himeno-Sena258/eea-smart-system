package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Schema(description = "班级教学改进反思表 VO")
public class TeachingImprovementVO {
    @Schema(description = "改进记录ID")
    private Long id;

    @Schema(description = "教学班ID")
    private Long classId;

    @Schema(description = "教学班级名称")
    private String className;

    @Schema(description = "低达成度课程目标列表 (低于 0.680 警戒线的目标)")
    private String lowAttainmentCos;

    @Schema(description = "原因与达成度不足分析")
    private String problemAnalysis;

    @Schema(description = "拟采取的针对性教学改进措施")
    private String improvementMeasures;

    @Schema(description = "提交教师ID")
    private Long createdBy;

    @Schema(description = "提交教师姓名")
    private String creatorName;

    @Schema(description = "提交时间")
    private LocalDateTime createdAt;
}
