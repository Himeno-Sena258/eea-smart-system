package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "新增课程 DTO")
public class CreateCourseDTO {

    @Schema(description = "培养方案ID")
    private Long schemeId;

    @Schema(description = "课程代码 (如 SE-303)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String courseCode;

    @Schema(description = "课程名称 (如 面向对象程序设计)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String courseName;

    @Schema(description = "学分 (如 3.0)", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal credits;

    @Schema(description = "总学时 (如 48)", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer hours;
}
