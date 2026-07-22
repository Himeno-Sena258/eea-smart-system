package com.eea;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import java.net.URI;
import java.net.http.*;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CoordinatorModuleIntegrationTest {
    private static final String BASE = "http://localhost:8080/api/v1";
    private static final HttpClient c = HttpClient.newHttpClient();
    private static final ObjectMapper om = new ObjectMapper();

    private JsonNode get(String path, String uid) throws Exception {
        var r = c.send(HttpRequest.newBuilder().uri(URI.create(BASE+path)).header("User-Id",uid).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        return om.readTree(r.body());
    }

    @Test @Order(1) @DisplayName("COOR-01: 课程大纲列表")
    void testSyllabusList() throws Exception {
        var n = get("/coordinator/syllabus", "102");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(2) @DisplayName("COOR-02: 课程大纲详情")
    void testSyllabusDetail() throws Exception {
        var n = get("/coordinator/courses/1/syllabus", "102");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(3) @DisplayName("COOR-03: 课程目标查询")
    void testObjectives() throws Exception {
        var n = get("/coordinator/courses/1/objectives", "102");
        assertEquals(0, n.get("code").asInt());
        assertTrue(n.get("data").size() > 0);
    }

    @Test @Order(4) @DisplayName("COOR-04: 考核方式查询")
    void testMethods() throws Exception {
        var n = get("/coordinator/courses/1/methods", "102");
        assertEquals(0, n.get("code").asInt());
        assertTrue(n.get("data").size() > 0);
    }

    @Test @Order(5) @DisplayName("COOR-05: 考核细项查询")
    void testItems() throws Exception {
        var n = get("/coordinator/courses/1/items", "102");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(6) @DisplayName("COOR-06: 课程列表+Dashboard")
    void testCoursesAndDashboard() throws Exception {
        assertEquals(0, get("/coordinator/courses", "102").get("code").asInt());
        assertEquals(0, get("/dashboard/coordinator", "102").get("code").asInt());
    }
}
