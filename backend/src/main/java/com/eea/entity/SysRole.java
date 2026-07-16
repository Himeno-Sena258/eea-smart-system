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
@TableName("sys_role")
@Schema(description = "系统角色表")
public class SysRole {

    @TableId(type = IdType.AUTO)
    @Schema(description = "角色ID")
    private Long id;

    @Schema(description = "角色名称")
    private String roleName;

    @Schema(description = "角色代码(STUDENT, INSTRUCTOR, COORDINATOR, DIRECTOR, ADMIN)")
    private String roleCode;

    @Schema(description = "描述")
    private String description;
}
