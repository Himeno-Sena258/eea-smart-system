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
@TableName("assessment_method")
@Schema(description = "课程考核评价方式表")
public class AssessmentMethod {

    @TableId(type = IdType.AUTO)
    @Schema(description = "考核方法ID")
    private Long id;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "考核项名称(如 期末考试, 课程实验, 平时作业)")
    private String name;

    @Schema(description = "考核占比权重(如 0.60, 0.20, 0.20)")
    private BigDecimal weight;
}
