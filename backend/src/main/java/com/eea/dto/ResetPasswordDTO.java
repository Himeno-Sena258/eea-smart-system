package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "管理员重置用户密码 DTO")
public class ResetPasswordDTO {

    @Schema(description = "新密码 (不传时后端默认重置为 123456)")
    private String newPassword;
}
