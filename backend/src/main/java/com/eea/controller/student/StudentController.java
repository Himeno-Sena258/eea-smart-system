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
@Tag(name = "学生门户模块", description = "个人小项成绩明细查询、个人毕业要求达成度分析")
@RequireRoles("STUDENT")
public class StudentController {

    @GetMapping("/hello")
    @Operation(summary = "学生门户模块测试")
    public Result<String> hello() {
        return Result.success("学生门户模块初始化");
    }
}
