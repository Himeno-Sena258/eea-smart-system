package com.eea.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/** 学生综合成绩总表 */
@Data
@AllArgsConstructor
public class StudentCourseScoreVO {
    private Long courseId;
    private String courseName;
    private Long teachingClassId;
    private String teachingClassName;
    private String semester;
    private BigDecimal homeworkScore;     // 平时作业总成绩
    private BigDecimal experimentScore;   // 课程实验总成绩
    private BigDecimal examScore;         // 期末卷面总分
    private BigDecimal totalScore;        // 综合总评
    private Boolean passed;               // 是否及格

    private List<StudentScoreItemVO> items; // 明细（5.1 需要时填充）
}
