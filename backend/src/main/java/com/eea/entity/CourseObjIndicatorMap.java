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
@TableName("course_obj_indicator_map")
@Schema(description = "课程目标与毕业要求指标点支撑权重矩阵")
public class CourseObjIndicatorMap {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "课程目标ID")
    private Long courseObjectiveId;

    @Schema(description = "毕业要求指标点ID")
    private Long indicatorPointId;

    @Schema(description = "支撑权重系数(0.01 - 1.00之间)")
    private BigDecimal weight;
}
