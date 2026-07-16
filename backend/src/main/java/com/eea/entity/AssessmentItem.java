package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("assessment_item")
@Schema(description = "课程考核细小项表(绑定课程目标)")
public class AssessmentItem {

    @TableId(type = IdType.AUTO)
    @Schema(description = "评价指标细项ID")
    private Long id;

    @Schema(description = "关联考核方法ID")
    private Long methodId;

    @Schema(description = "小项名称(如 试卷大题1, 实验报告1, 作业1)")
    private String name;

    @Schema(description = "考核小项满分")
    private BigDecimal maxScore;

    @Schema(description = "强绑定的唯一课程目标ID(OBE核心！)")
    private Long courseObjectiveId;
}
