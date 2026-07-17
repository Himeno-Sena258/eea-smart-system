package com.eea.controller.coordinator;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/coordinator")
@Tag(name = "课程负责人模块", description = "课程大纲管理、课程目标(CO1~CO5)绑定映射、考核环节权重配置")
@RequireRoles("COORDINATOR")
public class CoordinatorController {

    @GetMapping("/hello")
    @Operation(summary = "课程负责人模块测试")
    public Result<String> hello() {
        return Result.success("课程负责人模块初始化");
    }
}
