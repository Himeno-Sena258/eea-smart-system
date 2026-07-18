package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "批量设置考核环节占比权重 DTO (含 1.000 强校验)")
public class SaveMethodsDTO {

    @Schema(description = "课程ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long courseId;

    @Schema(description = "考核方式及权重列表", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<MethodItem> methods;

    @Data
    @Schema(description = "单个考核环节权重条目")
    public static class MethodItem {
        @Schema(description = "考核方式ID (已有填ID，新加留空)")
        private Long id;

        @Schema(description = "考核环节名称 (期末考试, 课程实验, 平时作业)", requiredMode = Schema.RequiredMode.REQUIRED)
        private String name;

        @Schema(description = "占比权重 (如 0.60, 0.20, 0.20)", requiredMode = Schema.RequiredMode.REQUIRED)
        private BigDecimal weight;
    }
}
