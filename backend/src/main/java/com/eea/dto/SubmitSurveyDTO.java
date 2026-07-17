package com.eea.dto;

import lombok.Data;
import java.util.Map;

/** 提交问卷 */
@Data
public class SubmitSurveyDTO {
    private Long questionnaireId;
    private Map<String, Object> answers;  // 题目 → 答案（自由格式键值对）
}
