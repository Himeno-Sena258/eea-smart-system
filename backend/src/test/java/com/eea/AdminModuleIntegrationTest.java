package com.eea;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import java.net.URI;
import java.net.http.*;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminModuleIntegrationTest {
    private static final String BASE = "http://localhost:8080/api/v1";
    private static final HttpClient c = HttpClient.newHttpClient();
    private static final ObjectMapper om = new ObjectMapper();

    private JsonNode get(String path, String uid) throws Exception {
        var r = c.send(HttpRequest.newBuilder().uri(URI.create(BASE+path)).header("User-Id",uid).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        return om.readTree(r.body());
    }
    private JsonNode post(String path, String uid, String body) throws Exception {
        var r = c.send(HttpRequest.newBuilder().uri(URI.create(BASE+path)).header("User-Id",uid)
                .header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofString());
        return om.readTree(r.body());
    }

    @Test @Order(1) @DisplayName("ADMIN-01: 用户分页查询")
    void testPageUsers() throws Exception {
        var n = get("/admin/users?pageNum=1&pageSize=5", "100");
        assertEquals(0, n.get("code").asInt());
        assertTrue(n.get("data").get("records").size() > 0);
    }

    @Test @Order(2) @DisplayName("ADMIN-02: 用户详情")
    void testUserDetail() throws Exception {
        var n = get("/admin/users/100", "100");
        assertEquals(0, n.get("code").asInt());
        assertEquals("admin", n.get("data").get("username").asText());
    }

    @Test @Order(3) @DisplayName("ADMIN-03: 组织树")
    void testOrgTree() throws Exception {
        var n = get("/organizations/tree", "100");
        assertEquals(0, n.get("code").asInt());
        assertTrue(n.get("data").size() > 0);
    }

    @Test @Order(4) @DisplayName("ADMIN-04: 启用禁用用户")
    void testToggleStatus() throws Exception {
        var r = c.send(HttpRequest.newBuilder().uri(URI.create(BASE+"/admin/users/201/status?status=1"))
                .header("User-Id","100").PUT(HttpRequest.BodyPublishers.noBody()).build(),
                HttpResponse.BodyHandlers.ofString());
        assertEquals(0, om.readTree(r.body()).get("code").asInt());
    }

    @Test @Order(5) @DisplayName("ADMIN-05: Dashboard统计")
    void testDashboard() throws Exception {
        var n = get("/dashboard/admin", "100");
        assertEquals(0, n.get("code").asInt());
        assertTrue(n.get("data").get("stats").size() >= 2);
    }

    @Test @Order(6) @DisplayName("ADMIN-06: 审计日志查询")
    void testAuditLog() throws Exception {
        var n = get("/admin/audit-logs?pageNum=1&pageSize=3", "100");
        assertEquals(0, n.get("code").asInt());
    }
}
