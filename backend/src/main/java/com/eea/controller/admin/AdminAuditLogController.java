package com.eea.controller.admin;

import com.eea.common.PageResult;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.dto.AuditLogQueryDTO;
import com.eea.entity.SysAuditLog;
import com.eea.service.admin.AdminAuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/audit-logs")
@Tag(name = "系统管理员-安全审计日志")
@RequireRoles("ADMIN")
public class AdminAuditLogController {

    @Autowired
    private AdminAuditLogService adminAuditLogService;

    @GetMapping
    @Operation(summary = "分页查询系统操作审计日志", description = "支持按账号、操作类型(LOGIN/CREATE/UPDATE/DELETE)、对象模块过滤")
    public Result<PageResult<SysAuditLog>> pageAuditLogs(@ParameterObject AuditLogQueryDTO dto) {
        PageResult<SysAuditLog> pageResult = adminAuditLogService.pageAuditLogs(dto);
        return Result.success(pageResult);
    }
}
