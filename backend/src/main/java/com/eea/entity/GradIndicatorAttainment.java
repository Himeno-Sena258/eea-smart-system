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
@TableName("grad_indicator_attainment")
@Schema(description = "毕业要求二级指标点达成度结果表")
public class GradIndicatorAttainment {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "培养方案ID")
    private Long schemeId;

    @Schema(description = "年级(如 2024)")
    private Integer grade;

    @Schema(description = "二级指标点ID")
    private Long indicatorPointId;

    @Schema(description = "直接达成度实测值(0.000 - 1.000)")
    private BigDecimal attainmentVal;

    @Schema(description = "统计生成时间")
    private LocalDateTime calculatedAt;
}
