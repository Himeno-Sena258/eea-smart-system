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
@TableName("survey_answer")
@Schema(description = "问卷答卷反馈表")
public class SurveyAnswer {

    @TableId(type = IdType.AUTO)
    @Schema(description = "回答ID")
    private Long id;

    @Schema(description = "问卷ID")
    private Long questionnaireId;

    @Schema(description = "填写用户ID(可匿名，如果是校外匿名填报)")
    private Long userId;

    @Schema(description = "问卷题目与反馈内容JSON数据")
    private String rawAnswersJson;

    @Schema(description = "提交时间")
    private LocalDateTime submittedAt;
}
