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
@Tag(name = "授课教师模块", description = "教学班花名册、小项成绩批量录入、课程目标达成度计算引擎")
@RequireRoles("INSTRUCTOR")
public class TeacherController {

    @GetMapping("/hello")
    @Operation(summary = "授课教师模块测试")
    public Result<String> hello() {
        return Result.success("授课教师模块初始化");
    }
}
