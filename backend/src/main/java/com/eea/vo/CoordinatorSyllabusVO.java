package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "课程教学大纲摘要 VO")
public class CoordinatorSyllabusVO {

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "课程代码")
    private String courseCode;

    @Schema(description = "课程名称")
    private String courseName;

    @Schema(description = "学分")
    private BigDecimal credits;

    @Schema(description = "总学时")
    private Integer hours;

    @Schema(description = "培养方案ID")
    private Long schemeId;

    @Schema(description = "培养方案名称")
    private String schemeName;

    @Schema(description = "课程负责人ID")
    private Long coordinatorId;

    @Schema(description = "课程负责人姓名")
    private String coordinatorName;

    @Schema(description = "大纲版本号 (如 2024版V1.0)")
    private String syllabusVersion;

    @Schema(description = "大纲审核状态: 0-草稿, 1-待审核, 2-已审核通过")
    private Integer auditStatus;

    @Schema(description = "审核状态中文说明 (草稿 / 待审核 / 已审核通过)")
    private String auditStatusDesc;
}
