package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "网格成绩批量录入 DTO")
public class BatchScoreInputDTO {

    @Data
    @Schema(description = "单项成绩数据单元")
    public static class SingleScoreItem {
        @Schema(description = "学生用户ID", requiredMode = Schema.RequiredMode.REQUIRED)
        private Long studentId;

        @Schema(description = "考核细项ID", requiredMode = Schema.RequiredMode.REQUIRED)
        private Long assessmentItemId;

        @Schema(description = "实际得分 (0 <= actualScore <= maxScore)", requiredMode = Schema.RequiredMode.REQUIRED)
        private BigDecimal actualScore;
    }

    @Schema(description = "待保存得分数组", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<SingleScoreItem> scores;
}
