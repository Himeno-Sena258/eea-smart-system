package com.eea.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

/** 单条考核细项得分 */
@Data
@AllArgsConstructor
public class StudentScoreItemVO {
    private Long itemId;
    private String itemName;          // 如"试卷第1题(建模题)"
    private BigDecimal score;         // 实际得分
    private BigDecimal maxScore;      // 满分
    private String objectiveCode;     // 绑定课程目标 CO1/CO2
    private String methodName;        // 所属考核方式 期末考试/课程实验/平时作业
}
