package com.eea.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/** 课程大纲查阅 */
@Data
@AllArgsConstructor
public class StudentSyllabusVO {
    private Long courseId;
    private String courseName;
    private BigDecimal credits;
    private Integer hours;
    private List<ObjectiveVO> objectives;
    private List<MethodVO> methods;

    @Data
    @AllArgsConstructor
    public static class ObjectiveVO {
        private String code;
        private String content;
        private List<String> indicatorCodes; // 支撑哪些指标点
    }

    @Data
    @AllArgsConstructor
    public static class MethodVO {
        private String name;
        private BigDecimal weight;
    }
}
