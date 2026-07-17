package com.eea.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

/** 学生个人毕业要求指标点达成度 */
@Data
@AllArgsConstructor
public class StudentAttainmentVO {
    private String indicatorCode;       // 如 1.1
    private String indicatorContent;    // 指标点内容
    private BigDecimal threshold;        // 合格标准线 0.680
    private BigDecimal attainmentValue;  // 个人达成度实测值
    private Boolean passed;              // 是否达标
    private String gradRequirementTitle; // 所属毕业要求（如"工程知识"）
}
