package com.eea;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import java.net.URI;
import java.net.http.*;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TeacherModuleIntegrationTest {
    private static final String BASE = "http://localhost:8080/api/v1";
    private static final HttpClient c = HttpClient.newHttpClient();
    private static final ObjectMapper om = new ObjectMapper();

    private JsonNode get(String path, String uid) throws Exception {
        var r = c.send(HttpRequest.newBuilder().uri(URI.create(BASE+path)).header("User-Id",uid).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        return om.readTree(r.body());
    }

    @Test @Order(1) @DisplayName("TCH-01: 授课班级列表")
    void testTeacherClasses() throws Exception {
        var n = get("/teacher/classes", "103");
        assertEquals(0, n.get("code").asInt());
        assertTrue(n.get("data").size() > 0);
    }

    @Test @Order(2) @DisplayName("TCH-02: 班级学生花名册")
    void testClassStudents() throws Exception {
        var n = get("/teacher/classes/1/students", "103");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(3) @DisplayName("TCH-03: 成绩网格表")
    void testScoreGrid() throws Exception {
        var n = get("/teacher/classes/1/score-grid", "103");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(4) @DisplayName("TCH-04: 总评成绩单")
    void testFinalScores() throws Exception {
        var n = get("/teacher/classes/1/final-scores", "103");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(5) @DisplayName("TCH-05: 班级达成度")
    void testAttainment() throws Exception {
        var n = get("/teacher/classes/1/attainment", "103");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(6) @DisplayName("TCH-06: 课程列表+Dashboard")
    void testCoursesAndDashboard() throws Exception {
        assertEquals(0, get("/teacher/courses", "103").get("code").asInt());
        assertEquals(0, get("/dashboard/teacher", "103").get("code").asInt());
    }
}
