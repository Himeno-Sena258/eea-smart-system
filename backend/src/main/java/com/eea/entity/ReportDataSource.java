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
@TableName("report_data_source")
@Schema(description = "报告章节数据自动填充配置表")
public class ReportDataSource {

    @TableId(type = IdType.AUTO)
    @Schema(description = "数据源ID")
    private Long id;

    @Schema(description = "所属章节ID")
    private Long sectionId;

    @Schema(description = "来源类型: ATTAINMENT-达成度, SURVEY-问卷, TABLE-数据表格, CHART-图表")
    private String sourceType;

    @Schema(description = "数据来源标识")
    private String sourceKey;

    @Schema(description = "自动填充JSON配置")
    private String autoFillConfig;
}
