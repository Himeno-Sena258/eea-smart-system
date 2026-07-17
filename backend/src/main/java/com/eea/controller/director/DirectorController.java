package com.eea.controller.director;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/director")
@Tag(name = "专业负责人模块", description = "毕业要求指标点配置、OBE矩阵支撑权重校验、专业级达成度计算")
@RequireRoles("DIRECTOR")
public class DirectorController {

    @GetMapping("/hello")
    @Operation(summary = "专业负责人模块测试")
    public Result<String> hello() {
        return Result.success("专业负责人模块初始化");
    }
}
