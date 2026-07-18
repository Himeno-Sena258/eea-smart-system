package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "认证样品归档提交 DTO")
public class UploadSampleDTO {

    @Schema(description = "关联考核模块ID (如 期末考试ID, 实验ID)", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long methodId;

    @Schema(description = "样品档次: HIGH-优秀, MEDIUM-中等, LOW-不及格", requiredMode = Schema.RequiredMode.REQUIRED)
    private String levelTag;

    @Schema(description = "归档文件名", requiredMode = Schema.RequiredMode.REQUIRED)
    private String fileName;

    @Schema(description = "访问路径 / URL", requiredMode = Schema.RequiredMode.REQUIRED)
    private String filePath;
}
