package com.eea.controller.common;

import com.eea.common.Result;
import com.eea.common.UserContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "1.1 系统首页概览", description = "集中收纳系统管理员、专业负责人、课程负责人、授课教师、学生所有角色的控制台首页接口")
public class DashboardController {

    @GetMapping("/admin")
    @Operation(summary = "【系统管理员】控制台首页", description = "获取系统总用户数、组织机构数、系统运行状态概览")
    public Result<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("title", "系统管理员控制台");
        data.put("userId", UserContext.getUserId());
        data.put("roles", UserContext.getRoles());
        data.put("notice", "欢迎进入工程教育认证智能服务系统控制台");
        return Result.success(data);
    }

    @GetMapping("/director")
    @Operation(summary = "【专业负责人】控制台首页", description = "获取培养方案统计、毕业要求指标点达成度概览")
    public Result<Map<String, Object>> getDirectorDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("title", "专业负责人控制台");
        data.put("userId", UserContext.getUserId());
        data.put("roles", UserContext.getRoles());
        return Result.success(data);
    }

    @GetMapping("/coordinator")
    @Operation(summary = "【课程负责人】控制台首页", description = "获取课程大纲审核状态、课程目标绑定分布概览")
    public Result<Map<String, Object>> getCoordinatorDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("title", "课程负责人控制台");
        data.put("userId", UserContext.getUserId());
        data.put("roles", UserContext.getRoles());
        return Result.success(data);
    }

    @GetMapping("/teacher")
    @Operation(summary = "【授课教师】控制台首页", description = "获取当前学期授课教学班列表、成绩录入进度概览")
    public Result<Map<String, Object>> getTeacherDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("title", "授课教师控制台");
        data.put("userId", UserContext.getUserId());
        data.put("roles", UserContext.getRoles());
        return Result.success(data);
    }

    @GetMapping("/student")
    @Operation(summary = "【学生】个人学业控制台首页", description = "获取个人选修课程达成度、毕业要求指标点达成分析图")
    public Result<Map<String, Object>> getStudentDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("title", "学生个人学业控制台");
        data.put("userId", UserContext.getUserId());
        data.put("roles", UserContext.getRoles());
        return Result.success(data);
    }
}
