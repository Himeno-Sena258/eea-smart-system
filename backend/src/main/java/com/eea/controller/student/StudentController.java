package com.eea.controller.student;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/student")
@Tag(name = "学生")
@RequireRoles("STUDENT")
public class StudentController {

    @GetMapping("/dashboard")
    @Operation(summary = "学生首页")
    public Result<String> dashboard() {
        return Result.success("学生首页");
    }
}
