package com.eea.controller.admin;

import com.eea.common.AuditLog;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.service.admin.AdminImportService;
import com.eea.vo.ExcelImportResultVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin/import")
@Tag(name = "系统管理员-数据批量导入")
@RequireRoles("ADMIN")
public class AdminImportController {

    @Autowired
    private AdminImportService adminImportService;

    @PostMapping(value = "/users", consumes = "multipart/form-data")
    @Operation(summary = "批量导入师生账号及角色", description = "上传包含账号、姓名、角色代码的 CSV/Excel 文件进行批量开户")
    @AuditLog(action = "IMPORT", target = "sys_user", detail = "批量导入师生账号")
    public Result<ExcelImportResultVO> importUsers(@RequestParam("file") MultipartFile file) {
        ExcelImportResultVO result = adminImportService.importUsers(file);
        return Result.success(result);
    }

    @PostMapping(value = "/teaching-classes", consumes = "multipart/form-data")
    @Operation(summary = "批量导入教务排课教学班", description = "上传包含课程ID、主讲教师ID、学期、教学班名的 CSV/Excel 文件")
    @AuditLog(action = "IMPORT", target = "teaching_class", detail = "批量导入教务排课教学班")
    public Result<ExcelImportResultVO> importTeachingClasses(@RequestParam("file") MultipartFile file) {
        ExcelImportResultVO result = adminImportService.importTeachingClasses(file);
        return Result.success(result);
    }

    @PostMapping(value = "/class-students", consumes = "multipart/form-data")
    @Operation(summary = "批量导入教学班选课学生花名册", description = "上传包含教学班ID、学生ID的选课列表文件")
    @AuditLog(action = "IMPORT", target = "teaching_class_student", detail = "批量导入教学班选课关系")
    public Result<ExcelImportResultVO> importClassStudents(@RequestParam("file") MultipartFile file) {
        ExcelImportResultVO result = adminImportService.importClassStudents(file);
        return Result.success(result);
    }
}
