package com.eea.service.admin;

import com.eea.common.PageResult;
import com.eea.dto.AuditLogQueryDTO;
import com.eea.entity.SysAuditLog;

public interface AdminAuditLogService {

    /**
     * 分页查询审计日志
     */
    PageResult<SysAuditLog> pageAuditLogs(AuditLogQueryDTO dto);
}
