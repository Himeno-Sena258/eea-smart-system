package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "审计日志查询 DTO")
public class AuditLogQueryDTO {

    @Schema(description = "页码，从 1 开始", defaultValue = "1")
    private Integer pageNum = 1;

    @Schema(description = "每页数量", defaultValue = "10")
    private Integer pageSize = 10;

    @Schema(description = "操作账号搜索")
    private String username;

    @Schema(description = "操作类型: LOGIN, CREATE, UPDATE, DELETE, EXPORT")
    private String action;

    @Schema(description = "操作模块/对象")
    private String target;
}
