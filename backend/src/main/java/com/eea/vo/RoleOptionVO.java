package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "角色字典选项 VO")
public class RoleOptionVO {

    @Schema(description = "角色显示名称 (如 系统管理员)", example = "系统管理员")
    private String label;

    @Schema(description = "角色代码 (如 ADMIN)", example = "ADMIN")
    private String value;
}
