package com.eea.service.admin;

import com.eea.vo.ExcelImportResultVO;
import org.springframework.web.multipart.MultipartFile;

public interface AdminImportService {

    /**
     * 上传 Excel 批量导入师生账号与角色
     */
    ExcelImportResultVO importUsers(MultipartFile file);

    /**
     * 上传 Excel 批量导入排课教学班
     */
    ExcelImportResultVO importTeachingClasses(MultipartFile file);

    /**
     * 上传 Excel 批量导入教学班选课学生名单
     */
    ExcelImportResultVO importClassStudents(MultipartFile file);
}
