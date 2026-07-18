package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "细项成绩网格完整数据 VO")
public class TeacherScoreGridVO {
    @Schema(description = "教学班ID")
    private Long classId;

    @Schema(description = "表头列表")
    private List<ScoreGridHeaderVO> headers;

    @Schema(description = "全班学生得分网格数据行")
    private List<ScoreGridRowVO> rows;
}
