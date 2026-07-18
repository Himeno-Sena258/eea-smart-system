package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "班级总评成绩单表 VO")
public class TeacherFinalScoreVO {
    @Schema(description = "学生ID")
    private Long studentId;

    @Schema(description = "学号")
    private String studentNo;

    @Schema(description = "姓名")
    private String studentName;

    @Schema(description = "平时作业总分 (权重占比折算前满分 100)")
    private BigDecimal homeworkScore;

    @Schema(description = "实验总分 (权重占比折算前满分 100)")
    private BigDecimal experimentScore;

    @Schema(description = "期末卷面总分 (满分 100)")
    private BigDecimal examScore;

    @Schema(description = "综合加权总评分 (0 - 100)")
    private BigDecimal totalScore;

    @Schema(description = "是否及格 (1-及格, 0-不及格)")
    private Integer isPassed;
}
