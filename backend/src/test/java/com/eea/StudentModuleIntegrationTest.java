package com.eea;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 学生模块集成测试 — 需要先启动Spring Boot应用再运行
 * 测试账号: stu_xiaoming, userId=201
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class StudentModuleIntegrationTest {

    private static final String BASE = "http://localhost:8080/api/v1";
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final ObjectMapper om = new ObjectMapper();

    private static JsonNode get(String path, String userId) throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + path))
                .header("User-Id", userId).GET().build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        return om.readTree(resp.body());
    }

    private static JsonNode post(String path, String userId, Object body) throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + path))
                .header("User-Id", userId)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(om.writeValueAsString(body)))
                .build();
        var resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        return om.readTree(resp.body());
    }

    private static int statusCode(String path, String userId) throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + path))
                .header("User-Id", userId).GET().build();
        return client.send(req, HttpResponse.BodyHandlers.ofString()).statusCode();
    }

    // ==================== 5.2 综合成绩总表 ====================
    @Test @Order(1) @DisplayName("TC-01: 综合成绩总表")
    void testListScores() throws Exception {
        var node = get("/student/scores", "201");
        assertEquals(0, node.get("code").asInt());
        assertEquals("软件工程", node.get("data").get(0).get("courseName").asText());
        assertTrue(node.get("data").get(0).get("passed").asBoolean());
    }

    // ==================== 5.1 课程小项分文明细 ====================
    @Test @Order(2) @DisplayName("TC-02: 课程小项分文明细")
    void testScoreDetail() throws Exception {
        var node = get("/student/scores/1/detail", "201");
        assertEquals(0, node.get("code").asInt());
        assertEquals(6, node.get("data").get("items").size());
        assertEquals("CO1", node.get("data").get("items").get(0).get("objectiveCode").asText());
    }

    // ==================== 5.3 达成度 ====================
    @Test @Order(3) @DisplayName("TC-03: 个人毕业要求达成度")
    void testAttainment() throws Exception {
        var node = get("/student/attainment", "201");
        assertEquals(0, node.get("code").asInt());
        // 达成度数据可能为0条（未录入完整成绩时），但code必须为0
        assertNotNull(node.get("data"));
    }

    // ==================== 5.4 课程大纲 ====================
    @Test @Order(4) @DisplayName("TC-04: 课程大纲列表")
    void testSyllabusList() throws Exception {
        var node = get("/student/syllabus", "201");
        assertEquals(0, node.get("code").asInt());
        assertTrue(node.get("data").size() > 0);
    }

    @Test @Order(5) @DisplayName("TC-05: 课程大纲详情")
    void testSyllabusDetail() throws Exception {
        var node = get("/student/syllabus/1", "201");
        assertEquals(0, node.get("code").asInt());
        assertEquals("软件工程", node.get("data").get("courseName").asText());
        assertTrue(node.get("data").get("objectives").size() > 0);
    }

    // ==================== 5.5 问卷 ====================
    @Test @Order(6) @DisplayName("TC-06: 问卷列表")
    void testSurveyList() throws Exception {
        var node = get("/student/surveys", "201");
        assertEquals(0, node.get("code").asInt());
        assertTrue(node.get("data").size() > 0);
    }

    @Test @Order(7) @DisplayName("TC-07: 提交问卷-先创建再提交")
    void testSubmitSurvey() throws Exception {
        // 先用管理员创建一个新问卷
        var createReq = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/surveys"))
                .header("User-Id", "100")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"title\":\"Test\",\"type\":\"STU_CO\",\"status\":1}"))
                .build();
        var createResp = client.send(createReq, HttpResponse.BodyHandlers.ofString());
        var created = om.readTree(createResp.body());
        long surveyId = created.get("data").get("id").asLong();

        // 学生提交新创建的问卷
        var body = java.util.Map.of("answers", java.util.Map.of("score", "5"));
        var node = post("/student/surveys/" + surveyId + "/submit", "201", body);
        assertEquals(0, node.get("code").asInt());
    }

    @Test @Order(8) @DisplayName("TC-08: 防重复提交-再次提交同一问卷")
    void testSubmitSurveyDuplicated() throws Exception {
        // 提交问卷1（已在种子数据中被提交过）
        var body = java.util.Map.of("answers", java.util.Map.of("x", "y"));
        var node = post("/student/surveys/1/submit", "201", body);
        assertEquals(80003, node.get("code").asInt());
    }

    // ==================== 安全测试 ====================
    @Test @Order(9) @DisplayName("TC-09: ADMIN越权 → 403")
    void testForbidden() throws Exception {
        assertEquals(403, statusCode("/student/scores", "100"));
    }

    @Test @Order(10) @DisplayName("TC-10: 无User-Id → 401")
    void testUnauthorized() throws Exception {
        var req = HttpRequest.newBuilder()
                .uri(URI.create(BASE + "/student/scores")).GET().build();
        assertEquals(401, client.send(req, HttpResponse.BodyHandlers.ofString()).statusCode());
    }
}
