package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("course_attainment")
@Schema(description = "教学班课程目标达成度直接评价计算结果表")
public class CourseAttainment {

    @TableId(type = IdType.AUTO)
    @Schema(description = "达成度计算结果ID")
    private Long id;

    @Schema(description = "教学班ID")
    private Long teachingClassId;

    @Schema(description = "课程目标ID")
    private Long courseObjectiveId;

    @Schema(description = "直接达成度实测值(0.000 - 1.000)")
    private BigDecimal attainmentVal;

    @Schema(description = "计算生成时间")
    private LocalDateTime calculatedAt;
}
