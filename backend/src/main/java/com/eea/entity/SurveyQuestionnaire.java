package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("survey_questionnaire")
@Schema(description = "间接评价调查问卷表")
public class SurveyQuestionnaire {

    @TableId(type = IdType.AUTO)
    @Schema(description = "问卷ID")
    private Long id;

    @Schema(description = "问卷名称")
    private String title;

    @Schema(description = "类型: STU_CO-学生课程目标达成问卷, GRADUATE-毕业生评价, EMPLOYER-用人单位评价")
    private String type;

    @Schema(description = "状态: 0-关闭, 1-开放中")
    private Integer status;

    @Schema(description = "发布时间")
    private LocalDateTime createdAt;
}
