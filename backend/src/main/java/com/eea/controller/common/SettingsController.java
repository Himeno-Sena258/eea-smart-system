package com.eea.controller.common;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.common.UserContext;
import com.eea.entity.SystemConfig;
import com.eea.mapper.SystemConfigMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
@Tag(name = "系统设置", description = "认证参数设置：学年、学期、达成度阈值")
public class SettingsController {

    @Autowired
    private SystemConfigMapper systemConfigMapper;

    @GetMapping
    @Operation(summary = "获取系统设置")
    public Result<SystemConfig> getSettings() {
        SystemConfig config = systemConfigMapper.selectById(1L);
        if (config == null) {
            config = new SystemConfig();
            config.setId(1L);
            config.setAcademicYear("2025-2026");
            config.setSemester(1);
            config.setAttainmentThreshold(new BigDecimal("0.680"));
            config.setCertificationStandard("2024版工程教育认证标准");
            systemConfigMapper.insert(config);
        }
        return Result.success(config);
    }

    @PutMapping
    @Operation(summary = "更新系统设置", description = "需要ADMIN角色")
    @RequireRoles("ADMIN")
    public Result<String> updateSettings(@RequestBody Map<String, Object> body) {
        SystemConfig config = systemConfigMapper.selectById(1L);
        if (config == null) {
            config = new SystemConfig();
            config.setId(1L);
        }
        if (body.containsKey("academicYear"))
            config.setAcademicYear((String) body.get("academicYear"));
        if (body.containsKey("semester"))
            config.setSemester(Integer.valueOf(body.get("semester").toString()));
        if (body.containsKey("attainmentThreshold"))
            config.setAttainmentThreshold(new BigDecimal(body.get("attainmentThreshold").toString()));
        if (body.containsKey("certificationStandard"))
            config.setCertificationStandard((String) body.get("certificationStandard"));
        config.setUpdatedBy(UserContext.getUserId());
        config.setUpdatedAt(LocalDateTime.now());

        if (config.getId() == null) {
            systemConfigMapper.insert(config);
        } else {
            systemConfigMapper.updateById(config);
        }
        return Result.success("系统设置保存成功");
    }
}
