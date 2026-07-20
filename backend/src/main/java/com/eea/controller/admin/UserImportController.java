package com.eea.controller.admin;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * §3 师生账号批量导入 — preview + submit 两阶段
 */
@RestController
@RequestMapping("/admin/users")
@Tag(name = "5.04 师生账号导入", description = "Excel批量导入预览与提交")
@RequireRoles("ADMIN")
public class UserImportController {

    // 简单内存缓存预览批次
    private static final Map<String, List<Map<String, Object>>> BATCH_CACHE = new LinkedHashMap<>();

    @PostMapping(value = "/import/preview", consumes = "multipart/form-data")
    @Operation(summary = "§3.1 导入预览", description = "上传Excel返回逐行校验结果")
    public Result<Map<String, Object>> preview(@RequestParam("file") MultipartFile file) {
        String batchId = "USER_IMPORT_" + System.currentTimeMillis();
        List<Map<String, Object>> rows = new ArrayList<>();
        int valid = 0, invalid = 0;

        try {
            // 用POI读取Excel
            org.apache.poi.ss.usermodel.Workbook wb =
                    org.apache.poi.ss.usermodel.WorkbookFactory.create(file.getInputStream());
            org.apache.poi.ss.usermodel.Sheet sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
                if (row == null) continue;
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("rowIndex", i + 1);
                r.put("username", getCell(row, 0));
                r.put("realName", getCell(row, 1));
                r.put("roleCodes", Arrays.asList(getCell(row, 2).split(",")));
                r.put("organizationName", getCell(row, 3));
                r.put("className", getCell(row, 4));
                r.put("phone", getCell(row, 5));
                String username = getCell(row, 0);
                if (username.isEmpty()) {
                    r.put("validation", "FAIL"); r.put("message", "账号不能为空"); invalid++;
                } else {
                    r.put("validation", "PASS"); r.put("message", "校验通过"); valid++;
                }
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
        result.put("rows", rows);
        return Result.success(result);
    }

    @PostMapping("/import")
    @Operation(summary = "§3.2 提交导入", description = "提交已通过预览校验的批次")
    public Result<Map<String, Object>> submit(@RequestBody Map<String, Object> body) {
        String batchId = (String) body.get("batchId");
        List<Map<String, Object>> rows = BATCH_CACHE.remove(batchId);
        if (rows == null) return Result.error(50001, "批次不存在或已过期");

        int success = 0, failed = 0;
        List<Map<String, Object>> errors = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            if ("PASS".equals(r.get("validation"))) {
                success++;
            } else {
                failed++;
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("rowIndex", r.get("rowIndex"));
                err.put("message", r.get("message"));
                errors.add(err);
            }
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
        if (cell == null) return "";
        return cell.toString().trim();
    }
}
