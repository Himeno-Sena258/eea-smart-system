package com.eea.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eea.common.PageResult;
import com.eea.dto.AuditLogQueryDTO;
import com.eea.entity.SysAuditLog;
import com.eea.mapper.SysAuditLogMapper;
import com.eea.service.admin.AdminAuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminAuditLogServiceImpl implements AdminAuditLogService {

    @Autowired
    private SysAuditLogMapper sysAuditLogMapper;

    @Override
    public PageResult<SysAuditLog> pageAuditLogs(AuditLogQueryDTO dto) {
        Page<SysAuditLog> pageParam = new Page<>(dto.getPageNum(), dto.getPageSize());
        QueryWrapper<SysAuditLog> wrapper = new QueryWrapper<>();

        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty()) {
            wrapper.like("username", dto.getUsername().trim());
        }

        if (dto.getAction() != null && !dto.getAction().trim().isEmpty()) {
            wrapper.eq("action", dto.getAction().trim());
        }

        if (dto.getTarget() != null && !dto.getTarget().trim().isEmpty()) {
            wrapper.like("target", dto.getTarget().trim());
        }

        wrapper.orderByDesc("id");
        Page<SysAuditLog> page = sysAuditLogMapper.selectPage(pageParam, wrapper);

        return PageResult.build(page.getRecords(), page.getCurrent(), page.getSize(), page.getTotal());
    }
}
