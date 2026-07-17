package com.eea.controller.admin;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@Tag(name = "系统管理员")
@RequireRoles("ADMIN")
public class AdminController {

    @GetMapping("/dashboard")
    @Operation(summary = "管理员首页")
    public Result<String> dashboard() {
        return Result.success("系统管理员首页");
    }
}
