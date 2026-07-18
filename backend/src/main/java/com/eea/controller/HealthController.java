package com.eea.controller;

import com.eea.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 健康检查 —— 前端同学调用这个接口验证后端是否启动成功
 */
@RestController
@Tag(name = "2.2 系统健康检查", description = "服务探活与运行状态监测")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "健康检查")
    public Result<Map<String, Object>> health() {
        return Result.success(Map.of(
                "status", "UP",
                "time", LocalDateTime.now()
        ));
    }
}
