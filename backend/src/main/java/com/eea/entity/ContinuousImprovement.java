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
@TableName("continuous_improvement")
@Schema(description = "课程教学班级质量持续改进分析报告")
public class ContinuousImprovement {

    @TableId(type = IdType.AUTO)
    @Schema(description = "持续改进记录ID")
    private Long id;

    @Schema(description = "教学班级ID")
    private Long teachingClassId;

    @Schema(description = "原因与达成度不足分析")
    private String problemAnalysis;

    @Schema(description = "下一步针对性教学改进措施")
    private String improvementMeasures;

    @Schema(description = "任课教师ID")
    private Long createdBy;

    @Schema(description = "建立时间")
    private LocalDateTime createdAt;

    private Integer status;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private String reviewerComment;
    private LocalDateTime updatedAt;
    private String lowAttainmentCos;
    private String cycleLabel;
    private LocalDateTime followUpAt;
    private String followUpResult;
}
