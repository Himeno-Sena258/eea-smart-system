package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "创建组织机构 DTO")
public class CreateOrgDTO {

    @Schema(description = "机构/部门/班级名称", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "父级机构ID(顶级学院为 null)")
    private Long parentId;

    @Schema(description = "类型: COLLEGE-学院, MAJOR-专业, CLASS-行政班", requiredMode = Schema.RequiredMode.REQUIRED)
    private String type;

    @Schema(description = "招收年级(针对行政班，如 2024)")
    private Integer grade;
}
