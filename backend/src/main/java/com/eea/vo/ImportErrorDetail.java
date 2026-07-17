package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Excel 导入错误行明细")
public class ImportErrorDetail {

    @Schema(description = "错误所在行数(从 1 开始)")
    private Integer rowIndex;

    @Schema(description = "错误字段名称")
    private String field;

    @Schema(description = "错误提示信息")
    private String message;
}
