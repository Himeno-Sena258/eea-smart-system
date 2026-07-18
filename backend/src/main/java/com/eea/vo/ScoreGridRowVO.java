package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.Map;
import lombok.Data;

@Data
@Schema(description = "细项成绩网格数据行 VO")
public class ScoreGridRowVO {
    @Schema(description = "学生ID")
    private Long studentId;

    @Schema(description = "学号")
    private String studentNo;

    @Schema(description = "姓名")
    private String studentName;

    @Schema(description = "各细项实际得分 Map (Key: itemId, Value: actualScore)")
    private Map<Long, BigDecimal> itemScores;
}
