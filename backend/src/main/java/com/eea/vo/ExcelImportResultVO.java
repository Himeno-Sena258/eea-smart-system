package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Excel 导入统计与错误结果 VO (对齐状态码规范 §15.3)")
public class ExcelImportResultVO {

    @Schema(description = "总读取行数")
    private Integer totalRows;

    @Schema(description = "成功导入行数")
    private Integer successRows;

    @Schema(description = "失败行数")
    private Integer failedRows;

    @Schema(description = "失败行错误列表")
    private List<ImportErrorDetail> errors = new ArrayList<>();
}
