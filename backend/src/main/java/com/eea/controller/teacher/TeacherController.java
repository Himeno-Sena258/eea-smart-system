package com.eea.controller.teacher;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/teacher")
@Tag(name = "授课教师")
@RequireRoles("INSTRUCTOR")
public class TeacherController {

    @GetMapping("/dashboard")
    @Operation(summary = "授课教师首页")
    public Result<String> dashboard() {
        return Result.success("授课教师首页");
    }
}
