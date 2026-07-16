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
@TableName("program_scheme")
@Schema(description = "人才培养方案表")
public class ProgramScheme {

    @TableId(type = IdType.AUTO)
    @Schema(description = "方案ID")
    private Long id;

    @Schema(description = "专业ID")
    private Long majorId;

    @Schema(description = "版本名称(如2024版人才培养方案)")
    private String versionName;

    @Schema(description = "状态: 0-草稿, 1-发布启用, 2-历史归档")
    private Integer status;

    @Schema(description = "创建人ID")
    private Long createdBy;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
