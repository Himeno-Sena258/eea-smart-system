package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("sys_audit_log")
@Schema(description = "系统操作审计日志表")
public class SysAuditLog {

    @TableId(type = IdType.AUTO)
    @Schema(description = "日志ID")
    private Long id;

    @Schema(description = "操作用户ID")
    private Long userId;

    @Schema(description = "操作账号(冗余，防止用户被删后日志丢失)")
    private String username;

    @Schema(description = "操作类型: LOGIN, CREATE, UPDATE, DELETE, EXPORT")
    private String action;

    @Schema(description = "操作对象(如表名或功能模块)")
    private String target;

    @Schema(description = "操作对象ID")
    private Long targetId;

    @Schema(description = "操作详情")
    private String detail;

    @Schema(description = "客户端IP")
    private String ipAddress;

    @Schema(description = "操作时间")
    private LocalDateTime createdAt;
}
