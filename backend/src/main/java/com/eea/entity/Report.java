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
@TableName("report")
@Schema(description = "自评报告主表")
public class Report {

    @TableId(type = IdType.AUTO)
    @Schema(description = "报告ID")
    private Long id;

    @Schema(description = "关联培养方案ID")
    private Long schemeId;

    @Schema(description = "报告标题")
    private String title;

    @Schema(description = "版本号(如 V1.0, V2.0)")
    private String version;

    @Schema(description = "状态: 0-编写中, 1-审核中, 2-已完成, 3-已归档")
    private Integer status;

    @Schema(description = "创建人(专业负责人)")
    private Long createdBy;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "最后更新时间")
    private LocalDateTime updatedAt;
}
