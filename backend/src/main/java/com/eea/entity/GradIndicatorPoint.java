package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("grad_indicator_point")
@Schema(description = "毕业要求二级指标点表")
public class GradIndicatorPoint {

    @TableId(type = IdType.AUTO)
    @Schema(description = "指标点ID")
    private Long id;

    @Schema(description = "所属毕业要求ID")
    private Long reqId;

    @Schema(description = "指标点编码(如 1.1, 1.2)")
    private String code;

    @Schema(description = "指标点具体拆解描述")
    private String content;
}
