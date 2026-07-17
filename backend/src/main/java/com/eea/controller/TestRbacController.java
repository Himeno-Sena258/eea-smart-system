package com.eea.controller;

import com.eea.common.RequireRoles;
import com.eea.common.UserContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test/rbac")
public class TestRbacController {

    @GetMapping("/admin-only")
    @RequireRoles("ADMIN")
    public String adminOnly() {
        return "【管理员专区】成功进入！您当前登录的用户ID是：" + UserContext.getUserId();
    }

    @GetMapping("/director-only")
    @RequireRoles("DIRECTOR")
    public String directorOnly() {
        return "【专业负责人专区】成功进入！您当前登录的用户ID是：" + UserContext.getUserId();
    }

    @GetMapping("/coordinator-only")
    @RequireRoles("COORDINATOR")
    public String coordinatorOnly() {
        return "【课程负责人专区】成功进入！您当前登录的用户ID是：" + UserContext.getUserId();
    }

    @GetMapping("/instructor-only")
    @RequireRoles("INSTRUCTOR")
    public String instructorOnly() {
        return "【授课教师专区】成功进入！您当前登录的用户ID是：" + UserContext.getUserId();
    }

    @GetMapping("/student-only")
    @RequireRoles("STUDENT")
    public String studentOnly() {
        return "【学生专区】成功进入！您当前登录的用户ID是：" + UserContext.getUserId();
    }
}
