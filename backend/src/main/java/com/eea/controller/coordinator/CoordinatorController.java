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
@Tag(name = "课程负责人")
@RequireRoles("COORDINATOR")
public class CoordinatorController {

    @GetMapping("/dashboard")
    @Operation(summary = "课程负责人首页")
    public Result<String> dashboard() {
        return Result.success("课程负责人首页");
    }
}
