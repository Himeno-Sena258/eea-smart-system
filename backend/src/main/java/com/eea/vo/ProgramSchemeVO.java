package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Schema(description = "培养方案概览 VO")
public class ProgramSchemeVO {
    @Schema(description = "方案ID")
    private Long id;

    @Schema(description = "专业ID")
    private Long majorId;

    @Schema(description = "专业名称")
    private String majorName;

    @Schema(description = "适用年级(如 2024)")
    private Integer grade;

    @Schema(description = "方案名称")
    private String name;

    @Schema(description = "毕业总学分要求")
    private BigDecimal totalCredits;

    @Schema(description = "状态: 0-草稿, 1-已发布归档")
    private Integer status;

    @Schema(description = "状态中文说明 (草稿 / 已发布归档)")
    private String statusDesc;

    @Schema(description = "毕业要求大项数 (如 12)")
    private Integer reqCount;

    @Schema(description = "二级指标点总数")
    private Integer indicatorPointCount;
}
