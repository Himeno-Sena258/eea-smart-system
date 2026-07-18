package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "授课教师班级列表 VO")
public class TeacherClassVO {
    @Schema(description = "教学班ID")
    private Long classId;

    @Schema(description = "教学班名称")
    private String className;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "课程名称")
    private String courseName;

    @Schema(description = "学期")
    private String semester;

    @Schema(description = "班级选课学生总人数")
    private Integer studentCount;
}
