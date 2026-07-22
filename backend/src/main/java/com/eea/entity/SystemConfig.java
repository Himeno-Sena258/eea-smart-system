package com.eea.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("system_config")
@Schema(description = "系统配置表")
public class SystemConfig {

    @TableId
    @Schema(description = "主键")
    private Long id;

    @Schema(description = "当前学年")
    private String academicYear;

    @Schema(description = "当前学期")
    private Integer semester;

    @Schema(description = "达成度阈值")
    private BigDecimal attainmentThreshold;

    @Schema(description = "认证标准版本")
    private String certificationStandard;

    @Schema(description = "更新人ID")
    private Long updatedBy;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
