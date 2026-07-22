package com.eea;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import java.net.URI;
import java.net.http.*;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class DirectorModuleIntegrationTest {
    private static final String BASE = "http://localhost:8080/api/v1";
    private static final HttpClient c = HttpClient.newHttpClient();
    private static final ObjectMapper om = new ObjectMapper();

    private JsonNode get(String path, String uid) throws Exception {
        var r = c.send(HttpRequest.newBuilder().uri(URI.create(BASE+path)).header("User-Id",uid).GET().build(),
                HttpResponse.BodyHandlers.ofString());
        return om.readTree(r.body());
    }

    @Test @Order(1) @DisplayName("DIR-01: 培养方案列表")
    void testListSchemes() throws Exception {
        var n = get("/director/schemes", "101");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(2) @DisplayName("DIR-02: 毕业要求+指标点")
    void testRequirements() throws Exception {
        var n = get("/director/schemes/1/requirements", "101");
        assertEquals(0, n.get("code").asInt());
        assertTrue(n.get("data").size() > 0);
    }

    @Test @Order(3) @DisplayName("DIR-03: OBE矩阵查询")
    void testObeMatrix() throws Exception {
        var n = get("/director/schemes/1/matrix", "101");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(4) @DisplayName("DIR-04: 矩阵权重校验")
    void testMatrixValidate() throws Exception {
        var r = c.send(HttpRequest.newBuilder().uri(URI.create(BASE+"/director/schemes/1/matrix/validate"))
                .header("User-Id","101").POST(HttpRequest.BodyPublishers.noBody()).build(),
                HttpResponse.BodyHandlers.ofString());
        int code = om.readTree(r.body()).get("code").asInt();
        // 0=校验通过, 30002=权重和不等于1.0 (测试数据可能不满足)
        assertTrue(code == 0 || code == 30002, "期望0或30002, 实际=" + code);
    }

    @Test @Order(5) @DisplayName("DIR-05: 专业达成度查询")
    void testAttainment() throws Exception {
        var n = get("/director/schemes/1/attainment?grade=2024", "101");
        assertEquals(0, n.get("code").asInt());
    }

    @Test @Order(6) @DisplayName("DIR-06: Dashboard统计")
    void testDashboard() throws Exception {
        var n = get("/dashboard/director", "101");
        assertEquals(0, n.get("code").asInt());
        assertTrue(n.get("data").get("stats").size() >= 2);
    }
}
