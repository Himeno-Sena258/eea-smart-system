package com.eea;

import com.eea.dto.LoginDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("后端全接口与业务逻辑集成自动化测试")
public class ApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ==================== 1. 认证与登录模块测试 ====================
    @Test
    @DisplayName("测试 1.1: 管理员正确密码登录")
    void testAdminLoginSuccess() throws Exception {
        LoginDTO dto = new LoginDTO();
        dto.setUsername("admin");
        dto.setPassword("123456");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.username").value("admin"))
                .andExpect(jsonPath("$.data.userId").value(100));
    }

    @Test
    @DisplayName("测试 1.2: 登录失败-错误密码测试")
    void testLoginWrongPassword() throws Exception {
        LoginDTO dto = new LoginDTO();
        dto.setUsername("admin");
        dto.setPassword("wrongpassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(20007))
                .andExpect(jsonPath("$.message").value("用户名或密码错误"));
    }

    @Test
    @DisplayName("测试 1.3: 获取当前登录用户信息 /auth/me")
    void testGetUserInfo() throws Exception {
        mockMvc.perform(get("/auth/me")
                        .header("User-Id", 100))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.userId").value(100))
                .andExpect(jsonPath("$.data.username").value("admin"));
    }

    // ==================== 2. 安全与 RBAC 权限测试 ====================
    @Test
    @DisplayName("测试 2.1: 未登录请求拦截测试 (应返回 401 与 20001 状态码)")
    void testUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/admin/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(20001))
                .andExpect(jsonPath("$.message").value("用户未登录"));
    }

    @Test
    @DisplayName("测试 2.2: 学生账号越权访问管理员接口测试 (应返回 403 与 20004 状态码)")
    void testForbiddenAccess() throws Exception {
        mockMvc.perform(get("/admin/users")
                        .header("User-Id", 201)) // 201 为学生小明
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(20004))
                .andExpect(jsonPath("$.message").value("无权限访问"));
    }

    // ==================== 3. 管理员模块 API 测试 ====================
    @Test
    @DisplayName("测试 3.1: 管理员分页查询用户列表 /admin/users")
    void testAdminPageUsers() throws Exception {
        mockMvc.perform(get("/admin/users")
                        .header("User-Id", 100)
                        .param("pageNum", "1")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.total").exists());
    }

    @Test
    @DisplayName("测试 3.2: 管理员获取组织架构树 /admin/organizations/tree")
    void testAdminOrgTree() throws Exception {
        mockMvc.perform(get("/admin/organizations/tree")
                        .header("User-Id", 100))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 3.3: 管理员查询安全审计日志 /admin/audit-logs")
    void testAdminAuditLogs() throws Exception {
        mockMvc.perform(get("/admin/audit-logs")
                        .header("User-Id", 100))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.records").isArray());
    }

    @Test
    @DisplayName("测试 3.4: 管理员重置密码接口 /admin/users/{id}/reset-password")
    void testAdminResetPassword() throws Exception {
        mockMvc.perform(put("/admin/users/201/reset-password")
                        .header("User-Id", 100))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").value("密码重置成功"));
    }

    // ==================== 4. 控制台首页概览测试 ====================
    @Test
    @DisplayName("测试 4.1: 系统管理员控制台首页 /dashboard/admin")
    void testAdminDashboard() throws Exception {
        mockMvc.perform(get("/dashboard/admin")
                        .header("User-Id", 100))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.title").value("系统管理员控制台"));
    }

    @Test
    @DisplayName("测试 4.2: 学生控制台首页 /dashboard/student")
    void testStudentDashboard() throws Exception {
        mockMvc.perform(get("/dashboard/student")
                        .header("User-Id", 201))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.title").value("学生个人学业控制台"));
    }

    // ==================== 5. 学生门户模块 API 测试 ====================
    @Test
    @DisplayName("测试 5.1: 学生查询综合成绩总表 /student/scores")
    void testStudentListScores() throws Exception {
        mockMvc.perform(get("/student/scores")
                        .header("User-Id", 201))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 5.2: 学生查询毕业要求达成表 /student/attainment")
    void testStudentListAttainment() throws Exception {
        mockMvc.perform(get("/student/attainment")
                        .header("User-Id", 201))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 5.3: 学生查阅课程大纲 /student/syllabus")
    void testStudentListSyllabus() throws Exception {
        mockMvc.perform(get("/student/syllabus")
                        .header("User-Id", 201))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 5.4: 学生查阅问卷列表 /student/surveys")
    void testStudentListSurveys() throws Exception {
        mockMvc.perform(get("/student/surveys")
                        .header("User-Id", 201))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    // ==================== 6. 授课教师模块 API 测试 ====================
    @Test
    @DisplayName("测试 6.1: 授课教师查询班级列表 /teacher/classes")
    void testTeacherListClasses() throws Exception {
        mockMvc.perform(get("/teacher/classes")
                        .header("User-Id", 103)) // 103 为教师张强
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 6.2: 授课教师查询学生花名册 /teacher/classes/1/students")
    void testTeacherListClassStudents() throws Exception {
        mockMvc.perform(get("/teacher/classes/1/students")
                        .header("User-Id", 103))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 6.3: 授课教师获取细项成绩网格表 /teacher/classes/1/score-grid")
    void testTeacherGetScoreGrid() throws Exception {
        mockMvc.perform(get("/teacher/classes/1/score-grid")
                        .header("User-Id", 103))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.headers").isArray())
                .andExpect(jsonPath("$.data.rows").isArray());
    }

    @Test
    @DisplayName("测试 6.4: 授课教师获取班级总评成绩单表 /teacher/classes/1/final-scores")
    void testTeacherListFinalScores() throws Exception {
        mockMvc.perform(get("/teacher/classes/1/final-scores")
                        .header("User-Id", 103))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 6.5: 授课教师一键计算班级 CO 达成度引擎 /teacher/classes/1/attainment/calculate")
    void testTeacherCalculateCoAttainment() throws Exception {
        mockMvc.perform(post("/teacher/classes/1/attainment/calculate")
                        .header("User-Id", 103))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 6.6: 授课教师查询认证归档样品列表 /teacher/classes/1/samples")
    void testTeacherListSamples() throws Exception {
        mockMvc.perform(get("/teacher/classes/1/samples")
                        .header("User-Id", 103))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }
}
