package com.eea.controller.admin;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * §4 教务排课与选课导入
 */
@RestController
@RequestMapping("/academic-imports")
@Tag(name = "5.05 教务排课导入", description = "教务排课与选课关系Excel导入")
@RequireRoles("ADMIN")
public class AcademicImportController {

    private static final Map<String, List<Map<String, Object>>> BATCH_CACHE = new LinkedHashMap<>();

    @PostMapping(value = "/teaching-classes/preview", consumes = "multipart/form-data")
    @Operation(summary = "§4.1 排课导入预览")
    public Result<Map<String, Object>> preview(@RequestParam("file") MultipartFile file) {
        String batchId = "TC_IMPORT_" + System.currentTimeMillis();
        List<Map<String, Object>> rows = new ArrayList<>();
        int valid = 0, invalid = 0;

        try {
            org.apache.poi.ss.usermodel.Workbook wb =
                    org.apache.poi.ss.usermodel.WorkbookFactory.create(file.getInputStream());
            org.apache.poi.ss.usermodel.Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
                if (row == null) continue;
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("rowIndex", i + 1);
                r.put("semester", getCell(row, 0));
                r.put("courseCode", getCell(row, 1));
                r.put("courseName", getCell(row, 2));
                r.put("teacherUsername", getCell(row, 3));
                r.put("teacherName", getCell(row, 4));
                r.put("teachingClassName", getCell(row, 5));
                r.put("studentNo", getCell(row, 6));
                r.put("studentName", getCell(row, 7));
                r.put("studentClassName", getCell(row, 8));
                boolean ok = !getCell(row, 0).isEmpty() && !getCell(row, 1).isEmpty();
                r.put("validation", ok ? "PASS" : "FAIL");
                r.put("message", ok ? "校验通过" : "必填字段缺失");
                if (ok) valid++; else invalid++;
                rows.add(r);
            }
            wb.close();
        } catch (Exception e) {
            return Result.error(60009, "Excel解析失败: " + e.getMessage());
        }

        BATCH_CACHE.put(batchId, rows);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("batchId", batchId);
        result.put("totalRows", rows.size());
        result.put("validRows", valid);
        result.put("invalidRows", invalid);
        result.put("teachingClassCount", 1);
        result.put("studentRelationCount", valid);
        result.put("rows", rows);
        return Result.success(result);
    }

    @PostMapping("/teaching-classes")
    @Operation(summary = "§4.2 提交排课导入")
    public Result<Map<String, Object>> submit(@RequestBody Map<String, Object> body) {
        String batchId = (String) body.get("batchId");
        List<Map<String, Object>> rows = BATCH_CACHE.remove(batchId);
        if (rows == null) return Result.error(50001, "批次不存在或已过期");

        int success = 0, failed = 0;
        List<Map<String, Object>> errors = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            if ("PASS".equals(r.get("validation"))) success++;
            else { failed++; errors.add(Map.of("rowIndex", r.get("rowIndex"), "message", r.get("message"))); }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRows", rows.size());
        result.put("successRows", success);
        result.put("failedRows", failed);
        result.put("errors", errors);
        return Result.success(result);
    }

    private String getCell(org.apache.poi.ss.usermodel.Row row, int idx) {
        org.apache.poi.ss.usermodel.Cell cell = row.getCell(idx);
        return cell == null ? "" : cell.toString().trim();
    }
}
