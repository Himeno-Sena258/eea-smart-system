package com.eea.controller.common;

import com.eea.common.Result;
import com.eea.common.UserContext;
import com.eea.mapper.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "9.4 工作台概览", description = "各角色控制台首页（统计卡片、待办、预警）")
public class DashboardController {

    @Autowired private SysUserMapper sysUserMapper;
    @Autowired private SysOrganizationMapper sysOrganizationMapper;
    @Autowired private SysRoleMapper sysRoleMapper;
    @Autowired private SysAuditLogMapper sysAuditLogMapper;
    @Autowired private ProgramSchemeMapper programSchemeMapper;
    @Autowired private GradRequirementMapper gradRequirementMapper;
    @Autowired private CourseMapper courseMapper;
    @Autowired private TeachingClassMapper teachingClassMapper;
    @Autowired private TeachingClassStudentMapper tcsMapper;
    @Autowired private StudentCourseScoreMapper scsMapper;
    @Autowired private SurveyQuestionnaireMapper sqMapper;
    @Autowired private SurveyAnswerMapper saMapper;
    @Autowired private ReportSectionMapper reportSectionMapper;
    @Autowired private ReportMapper reportMapper;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Map<String,Object> base(String title) {
        Map<String,Object> d = new LinkedHashMap<>();
        d.put("title", title);
        d.put("userId", UserContext.getUserId());
        d.put("roles", UserContext.getRoles());
        d.put("generatedAt", LocalDateTime.now().format(FMT));
        d.put("stats", new ArrayList<>());
        d.put("todos", new ArrayList<>());
        d.put("warnings", new ArrayList<>());
        return d;
    }
    private Map<String,Object> stat(String key, String label, Object value, String unit) {
        Map<String,Object> s = new LinkedHashMap<>();
        s.put("key", key); s.put("label", label); s.put("value", value); s.put("unit", unit); s.put("status", "NORMAL");
        return s;
    }
    private Map<String,Object> todo(String id, String title, String path, String priority) {
        Map<String,Object> t = new LinkedHashMap<>();
        t.put("id", id); t.put("title", title); t.put("targetPath", path); t.put("priority", priority);
        return t;
    }

    @GetMapping("/admin")
    @Operation(summary = "系统管理员控制台")
    public Result<Map<String,Object>> admin() {
        Map<String,Object> d = base("系统管理员控制台");
        d.put("notice", "欢迎进入工程教育认证智能服务系统控制台");
        List<Map<String,Object>> stats = (List<Map<String,Object>>) d.get("stats");
        stats.add(stat("userCount", "用户总数", sysUserMapper.selectCount(null), "人"));
        stats.add(stat("orgCount", "组织数", sysOrganizationMapper.selectCount(null), "个"));
        stats.add(stat("roleCount", "角色数", sysRoleMapper.selectCount(null), "个"));
        stats.add(stat("auditLogCount", "今日审计日志", sysAuditLogMapper.selectCount(null), "条"));
        return Result.success(d);
    }

    @GetMapping("/director")
    @Operation(summary = "专业负责人控制台")
    public Result<Map<String,Object>> director() {
        Map<String,Object> d = base("专业负责人控制台");
        List<Map<String,Object>> stats = (List<Map<String,Object>>) d.get("stats");
        stats.add(stat("schemeCount", "培养方案", programSchemeMapper.selectCount(null), "个"));
        stats.add(stat("requirementCount", "毕业要求", gradRequirementMapper.selectCount(null), "项"));
        stats.add(stat("courseCount", "专业课程", courseMapper.selectCount(null), "门"));
        List<Map<String,Object>> todos = (List<Map<String,Object>>) d.get("todos");
        todos.add(todo("report-progress", "自评报告章节待完成", "/reports", "HIGH"));
        return Result.success(d);
    }

    @GetMapping("/coordinator")
    @Operation(summary = "课程负责人控制台")
    public Result<Map<String,Object>> coordinator() {
        Map<String,Object> d = base("课程负责人控制台");
        List<Map<String,Object>> stats = (List<Map<String,Object>>) d.get("stats");
        stats.add(stat("courseCount", "管辖课程", courseMapper.selectCount(null), "门"));
        stats.add(stat("tcCount", "教学班", teachingClassMapper.selectCount(null), "个"));
        return Result.success(d);
    }

    @GetMapping("/teacher")
    @Operation(summary = "授课教师控制台")
    public Result<Map<String,Object>> teacher() {
        Long userId = UserContext.getUserId();
        Map<String,Object> d = base("授课教师控制台");
        List<Map<String,Object>> stats = (List<Map<String,Object>>) d.get("stats");
        var tcW = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.eea.entity.TeachingClass>();
        tcW.eq("teacher_id", userId);
        stats.add(stat("tcCount", "我的教学班", teachingClassMapper.selectCount(tcW), "个"));
        return Result.success(d);
    }

    @GetMapping("/student")
    @Operation(summary = "学生个人学业控制台")
    public Result<Map<String,Object>> student() {
        Long userId = UserContext.getUserId();
        Map<String,Object> d = base("学生个人学业控制台");
        List<Map<String,Object>> stats = (List<Map<String,Object>>) d.get("stats");

        var tcsW = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.eea.entity.TeachingClassStudent>();
        tcsW.eq("student_id", userId);
        stats.add(stat("courseCount", "已修/在修课程", tcsMapper.selectCount(tcsW), "门"));

        var scsW = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.eea.entity.StudentCourseScore>();
        scsW.eq("student_id", userId).eq("is_passed", 1);
        stats.add(stat("passedCount", "已通过课程", scsMapper.selectCount(scsW), "门"));

        var saW = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.eea.entity.SurveyAnswer>();
        saW.eq("user_id", userId);
        long answered = saMapper.selectCount(saW);
        long total = sqMapper.selectCount(null);
        stats.add(stat("surveyProgress", "问卷进度", answered + "/" + total, "份"));

        List<Map<String,Object>> todos = (List<Map<String,Object>>) d.get("todos");
        if (answered < total) todos.add(todo("pending-survey", "填写待提交问卷", "/surveys", "MEDIUM"));
        return Result.success(d);
    }
}
