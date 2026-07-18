package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Schema(description = "专业认证自评报告 VO")
public class SelfReportVO {
    @Schema(description = "自评报告ID")
    private Long id;

    @Schema(description = "培养方案ID")
    private Long schemeId;

    @Schema(description = "培养方案名称")
    private String schemeName;

    @Schema(description = "报告标题")
    private String title;

    @Schema(description = "版本号 (如 V1.0, V2.0)")
    private String version;

    @Schema(description = "状态: 0-编写中, 1-审核中, 2-已完成, 3-已归档")
    private Integer status;

    @Schema(description = "状态中文说明")
    private String statusDesc;

    @Schema(description = "专业平均毕业达成度总分 (0.000 - 1.000)")
    private BigDecimal overallAttainmentVal;

    @Schema(description = "报告 PDF / Word 下载访问 URL")
    private String downloadUrl;

    @Schema(description = "创建/导出时间")
    private LocalDateTime createdAt;
}
