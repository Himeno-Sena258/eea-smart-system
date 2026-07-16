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
@TableName("grad_requirement")
@Schema(description = "毕业要求大项表(12条基本标准)")
public class GradRequirement {

    @TableId(type = IdType.AUTO)
    @Schema(description = "毕业要求ID")
    private Long id;

    @Schema(description = "培养方案ID")
    private Long schemeId;

    @Schema(description = "编码(如 GR1, GR2)")
    private String code;

    @Schema(description = "标题(如 工程知识)")
    private String title;

    @Schema(description = "毕业要求具体描述")
    private String content;
}
