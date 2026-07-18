package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "授课班级学生花名册 VO")
public class TeacherClassStudentVO {
    @Schema(description = "学生ID")
    private Long studentId;

    @Schema(description = "学号")
    private String studentNo;

    @Schema(description = "姓名")
    private String studentName;

    @Schema(description = "行政班级")
    private String adminClassName;

    @Schema(description = "课程名称")
    private String courseName;

    @Schema(description = "学期")
    private String semester;

    @Schema(description = "选课状态 (1-正常在读, 0-已退课)")
    private Integer selectStatus;
}
