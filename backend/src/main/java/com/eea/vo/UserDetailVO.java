package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "管理员视角用户明细 VO")
public class UserDetailVO {

    @Schema(description = "用户ID")
    private Long id;

    @Schema(description = "登录账号(学工号)")
    private String username;

    @Schema(description = "真实姓名")
    private String realName;

    @Schema(description = "电子邮箱")
    private String email;

    @Schema(description = "手机号码")
    private String phone;

    @Schema(description = "账号状态(1-启用, 0-禁用)")
    private Integer status;

    @Schema(description = "所属组织ID")
    private Long orgId;

    @Schema(description = "所属组织/专业/学院名称")
    private String orgName;

    @Schema(description = "角色代码列表")
    private List<String> roleCodes;

    @Schema(description = "角色中文名列表")
    private List<String> roleNames;

    @Schema(description = "学号(针对学生)")
    private String studentNo;

    @Schema(description = "行政班级ID(针对学生)")
    private Long classId;

    @Schema(description = "行政班级名称(针对学生)")
    private String className;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}
