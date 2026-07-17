package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("student_course_score")
@Schema(description = "学生综合总评成绩单")
public class StudentCourseScore {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "学生ID")
    private Long studentId;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "教学班ID")
    private Long teachingClassId;

    @Schema(description = "平时作业总成绩")
    private BigDecimal homeworkScore;

    @Schema(description = "课程实验总成绩")
    private BigDecimal experimentScore;

    @Schema(description = "期末卷面总分")
    private BigDecimal examScore;

    @Schema(description = "综合总评成绩")
    private BigDecimal totalScore;

    @Schema(description = "是否及格(1-及格, 0-不及格)")
    private Integer isPassed;
}
