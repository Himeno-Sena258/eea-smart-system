package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "管理员创建用户 DTO")
public class CreateUserDTO {

    @Schema(description = "登录账号(工号或学号)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String username;

    @Schema(description = "初始密码(不填则默认为 123456)")
    private String password;

    @Schema(description = "真实姓名", requiredMode = Schema.RequiredMode.REQUIRED)
    private String realName;

    @Schema(description = "电子邮箱")
    private String email;

    @Schema(description = "手机号码")
    private String phone;

    @Schema(description = "所属组织架构ID")
    private Long orgId;

    @Schema(description = "赋予的角色代码列表(如 [ADMIN], [DIRECTOR, INSTRUCTOR])", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<String> roleCodes;

    @Schema(description = "学号(针对学生角色必填)")
    private String studentNo;

    @Schema(description = "行政班级ID(针对学生角色必填)")
    private Long classId;
}
