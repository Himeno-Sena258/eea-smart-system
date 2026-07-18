package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "保存/更新课程教学大纲 DTO")
public class SaveSyllabusDTO {

    @Schema(description = "课程ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long courseId;

    @Schema(description = "课程代码", requiredMode = Schema.RequiredMode.REQUIRED)
    private String courseCode;

    @Schema(description = "课程名称", requiredMode = Schema.RequiredMode.REQUIRED)
    private String courseName;

    @Schema(description = "学分", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal credits;

    @Schema(description = "总学时", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer hours;

    @Schema(description = "大纲版本号 (如 2024版V1.0)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String syllabusVersion;
}
