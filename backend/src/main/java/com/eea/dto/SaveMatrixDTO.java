package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "OBE 矩阵支撑权重配置 DTO")
public class SaveMatrixDTO {

    @Schema(description = "培养方案ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long schemeId;

    @Schema(description = "矩阵权重配置单元格列表", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<MatrixItem> matrixItems;

    @Data
    @Schema(description = "单单元格权重配置")
    public static class MatrixItem {
        @Schema(description = "课程目标ID", requiredMode = Schema.RequiredMode.REQUIRED)
        private Long courseObjectiveId;

        @Schema(description = "毕业要求指标点ID", requiredMode = Schema.RequiredMode.REQUIRED)
        private Long indicatorPointId;

        @Schema(description = "支撑权重系数 (0.01 - 1.00)", requiredMode = Schema.RequiredMode.REQUIRED)
        private BigDecimal weight;
    }
}
