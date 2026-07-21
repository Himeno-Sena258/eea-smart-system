package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "当前登录用户详细信息 VO")
public class UserInfoVO {

    @Schema(description = "用户ID")
    private Long id;

    @Schema(description = "登录账号(学工号)")
    private String username;

    @Schema(description = "真实姓名")
    private String realName;

    @Schema(description = "邮箱")
    private String email;

    @Schema(description = "手机号")
    private String phone;

    @Schema(description = "所属组织ID")
    private Long orgId;

    @Schema(description = "所属组织/部门/班级名称")
    private String orgName;

    @Schema(description = "拥有的角色代码列表(如 [ADMIN, DIRECTOR])")
    private List<String> roleCodes;

    @Schema(description = "拥有的角色中文名称列表(如 [系统管理员, 专业负责人])")
    private List<String> roleNames;
    private String avatarUrl;
}
