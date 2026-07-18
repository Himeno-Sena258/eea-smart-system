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

    // ==================== 7. 专业负责人模块 API 测试 ====================
    @Test
    @DisplayName("测试 7.1: 专业负责人查询培养方案列表 /director/schemes")
    void testDirectorListSchemes() throws Exception {
        mockMvc.perform(get("/director/schemes")
                        .header("User-Id", 101)) // 101 为专业负责人王教授
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 7.2: 专业负责人查询毕业要求拆解表 /director/schemes/1/requirements")
    void testDirectorListRequirements() throws Exception {
        mockMvc.perform(get("/director/schemes/1/requirements")
                        .header("User-Id", 101))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 7.3: 专业负责人获取 OBE 课程矩阵与支撑权重配置 /director/schemes/1/matrix")
    void testDirectorGetObeMatrix() throws Exception {
        mockMvc.perform(get("/director/schemes/1/matrix")
                        .header("User-Id", 101))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.rows").isArray());
    }

    @Test
    @DisplayName("测试 7.4: 专业负责人强制校验各指标点支撑权重和 ΣW = 1.000 /director/schemes/1/matrix/validate")
    void testDirectorValidateObeMatrix() throws Exception {
        mockMvc.perform(post("/director/schemes/1/matrix/validate")
                        .header("User-Id", 101))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").exists());
    }

    @Test
    @DisplayName("测试 7.5: 专业负责人执行专业毕业达成度计算总引擎 /director/schemes/1/attainment/calculate")
    void testDirectorCalculateGradAttainment() throws Exception {
        mockMvc.perform(post("/director/schemes/1/attainment/calculate")
                        .header("User-Id", 101)
                        .param("grade", "2024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 7.6: 专业负责人查询专业自评报告列表 /director/schemes/1/reports")
    void testDirectorListReports() throws Exception {
        mockMvc.perform(get("/director/schemes/1/reports")
                        .header("User-Id", 101))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 7.7: 专业负责人生成/导出自评报告 /director/schemes/1/reports/generate")
    void testDirectorGenerateReport() throws Exception {
        com.eea.dto.GenerateReportDTO dto = new com.eea.dto.GenerateReportDTO();
        dto.setSchemeId(1L);
        dto.setTitle("2024版计算机科学与技术工程教育专业认证自评报告");
        dto.setVersion("V1.0");

        mockMvc.perform(post("/director/schemes/1/reports/generate")
                        .header("User-Id", 101)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.title").value("2024版计算机科学与技术工程教育专业认证自评报告"))
                .andExpect(jsonPath("$.data.downloadUrl").exists());
    }

    // ==================== 8. 课程负责人模块 API 测试 ====================
    @Test
    @DisplayName("测试 8.1: 课程负责人查询管辖的课程大纲列表 /coordinator/syllabus")
    void testCoordinatorListSyllabus() throws Exception {
        mockMvc.perform(get("/coordinator/syllabus")
                        .header("User-Id", 102)) // 102 为课程负责人李副教授
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 8.2: 课程负责人查询课程目标(CO1~CO5)列表 /coordinator/courses/1/objectives")
    void testCoordinatorListObjectives() throws Exception {
        mockMvc.perform(get("/coordinator/courses/1/objectives")
                        .header("User-Id", 102))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 8.3: 课程负责人查询考核环节占比权重 /coordinator/courses/1/methods")
    void testCoordinatorListMethods() throws Exception {
        mockMvc.perform(get("/coordinator/courses/1/methods")
                        .header("User-Id", 102))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 8.4: 课程负责人查询考核细项与 CO 绑定映射 /coordinator/courses/1/items")
    void testCoordinatorListItems() throws Exception {
        mockMvc.perform(get("/coordinator/courses/1/items")
                        .header("User-Id", 102))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("测试 8.5: 课程负责人设置考核环节权重(合法和等于1.000) /coordinator/courses/1/methods")
    void testCoordinatorSaveMethods() throws Exception {
        com.eea.dto.SaveMethodsDTO dto = new com.eea.dto.SaveMethodsDTO();
        dto.setCourseId(1L);
        List<com.eea.dto.SaveMethodsDTO.MethodItem> items = new java.util.ArrayList<>();
        
        com.eea.dto.SaveMethodsDTO.MethodItem m1 = new com.eea.dto.SaveMethodsDTO.MethodItem();
        m1.setName("期末考试");
        m1.setWeight(new java.math.BigDecimal("0.60"));
        items.add(m1);

        com.eea.dto.SaveMethodsDTO.MethodItem m2 = new com.eea.dto.SaveMethodsDTO.MethodItem();
        m2.setName("课程实验");
        m2.setWeight(new java.math.BigDecimal("0.20"));
        items.add(m2);

        com.eea.dto.SaveMethodsDTO.MethodItem m3 = new com.eea.dto.SaveMethodsDTO.MethodItem();
        m3.setName("平时作业");
        m3.setWeight(new java.math.BigDecimal("0.20"));
        items.add(m3);

        dto.setMethods(items);

        mockMvc.perform(post("/coordinator/courses/1/methods")
                        .header("User-Id", 102)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}
