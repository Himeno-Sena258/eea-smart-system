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
@Tag(name = "专业负责人")
@RequireRoles("DIRECTOR")
public class DirectorController {

    @GetMapping("/dashboard")
    @Operation(summary = "【专业负责人】控制台首页", tags = {"系统首页概览"})
    public Result<String> dashboard() {
        return Result.success("专业负责人首页");
    }
}
