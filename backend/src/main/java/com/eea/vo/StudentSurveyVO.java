package com.eea.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

/** 问卷列表/详情 */
@Data
@AllArgsConstructor
public class StudentSurveyVO {
    private Long id;
    private String title;
    private String type;                  // STU_CO / GRADUATE / EMPLOYER
    private LocalDateTime createdAt;
    private Boolean submitted;             // 当前学生是否已提交
}
