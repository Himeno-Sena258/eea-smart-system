package com.eea.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.BusinessException;
import com.eea.entity.SysRole;
import com.eea.entity.SysUser;
import com.eea.entity.SysUserRole;
import com.eea.entity.TeachingClass;
import com.eea.entity.TeachingClassStudent;
import com.eea.mapper.SysRoleMapper;
import com.eea.mapper.SysUserMapper;
import com.eea.mapper.SysUserRoleMapper;
import com.eea.mapper.TeachingClassMapper;
import com.eea.mapper.TeachingClassStudentMapper;
import com.eea.service.admin.AdminImportService;
import com.eea.vo.ExcelImportResultVO;
import com.eea.vo.ImportErrorDetail;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AdminImportServiceImpl implements AdminImportService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Autowired
    private SysUserRoleMapper sysUserRoleMapper;

    @Autowired
    private TeachingClassMapper teachingClassMapper;

    @Autowired
    private TeachingClassStudentMapper teachingClassStudentMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ExcelImportResultVO importUsers(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(60001, "导入文件不能为空");
        }

        List<ImportErrorDetail> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;
        int failedRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int rowIndex = 0;
            String defaultPwdHash = passwordEncoder.encode("123456");

            while ((line = reader.readLine()) != null) {
                rowIndex++;
                // 跳过标题行
                if (rowIndex == 1 && (line.contains("账号") || line.contains("username"))) {
                    continue;
                }

                totalRows++;
                String[] cols = line.split(",");
                if (cols.length < 3) {
                    failedRows++;
                    errors.add(new ImportErrorDetail(rowIndex, "format", "数据列数不足，需包含: 账号,姓名,角色代码"));
                    continue;
                }

                String username = cols[0].trim();
                String realName = cols[1].trim();
                String roleCode = cols[2].trim();

                if (username.isEmpty() || realName.isEmpty()) {
                    failedRows++;
                    errors.add(new ImportErrorDetail(rowIndex, "username/realName", "账号和姓名不能为空"));
                    continue;
                }

                // 校验账号重名
                QueryWrapper<SysUser> checkWrapper = new QueryWrapper<>();
                checkWrapper.eq("username", username);
                if (sysUserMapper.selectCount(checkWrapper) > 0) {
                    failedRows++;
                    errors.add(new ImportErrorDetail(rowIndex, "username", "账号 " + username + " 已存在"));
                    continue;
                }

                // 校验角色存在
                QueryWrapper<SysRole> roleWrapper = new QueryWrapper<>();
                roleWrapper.eq("role_code", roleCode);
                SysRole role = sysRoleMapper.selectOne(roleWrapper);
                if (role == null) {
                    failedRows++;
                    errors.add(new ImportErrorDetail(rowIndex, "roleCode", "角色代码 " + roleCode + " 不存在"));
                    continue;
                }

                // 创建用户
                SysUser user = SysUser.builder()
                        .username(username)
                        .password(defaultPwdHash)
                        .realName(realName)
                        .status(1)
                        .build();
                sysUserMapper.insert(user);

                // 绑定角色
                sysUserRoleMapper.insert(new SysUserRole(user.getId(), role.getId()));
                successRows++;
            }
        } catch (Exception e) {
            throw new BusinessException(60009, "解析导入文件失败: " + e.getMessage());
        }

        return ExcelImportResultVO.builder()
                .totalRows(totalRows)
                .successRows(successRows)
                .failedRows(failedRows)
                .errors(errors)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ExcelImportResultVO importTeachingClasses(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(60001, "导入文件不能为空");
        }

        List<ImportErrorDetail> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;
        int failedRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int rowIndex = 0;

            while ((line = reader.readLine()) != null) {
                rowIndex++;
                if (rowIndex == 1 && (line.contains("课程") || line.contains("courseId"))) {
                    continue;
                }

                totalRows++;
                String[] cols = line.split(",");
                if (cols.length < 4) {
                    failedRows++;
                    errors.add(new ImportErrorDetail(rowIndex, "format", "格式不足: 课程ID,教师ID,学期,班级名"));
                    continue;
                }

                try {
                    Long courseId = Long.parseLong(cols[0].trim());
                    Long teacherId = Long.parseLong(cols[1].trim());
                    String semester = cols[2].trim();
                    String className = cols[3].trim();

                    TeachingClass tc = new TeachingClass();
                    tc.setCourseId(courseId);
                    tc.setTeacherId(teacherId);
                    tc.setSemester(semester);
                    tc.setClassName(className);

                    teachingClassMapper.insert(tc);
                    successRows++;
                } catch (Exception ex) {
                    failedRows++;
                    errors.add(new ImportErrorDetail(rowIndex, "parse", "解析错误: " + ex.getMessage()));
                }
            }
        } catch (Exception e) {
            throw new BusinessException(60009, "解析排课文件失败: " + e.getMessage());
        }

        return ExcelImportResultVO.builder()
                .totalRows(totalRows)
                .successRows(successRows)
                .failedRows(failedRows)
                .errors(errors)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ExcelImportResultVO importClassStudents(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(60001, "导入文件不能为空");
        }

        List<ImportErrorDetail> errors = new ArrayList<>();
        int totalRows = 0;
        int successRows = 0;
        int failedRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int rowIndex = 0;

            while ((line = reader.readLine()) != null) {
                rowIndex++;
                if (rowIndex == 1 && (line.contains("教学班") || line.contains("teachingClassId"))) {
                    continue;
                }

                totalRows++;
                String[] cols = line.split(",");
                if (cols.length < 2) {
                    failedRows++;
                    errors.add(new ImportErrorDetail(rowIndex, "format", "格式不足: 教学班ID,学生ID"));
                    continue;
                }

                try {
                    Long tcId = Long.parseLong(cols[0].trim());
                    Long studentId = Long.parseLong(cols[1].trim());

                    TeachingClassStudent tcs = new TeachingClassStudent();
                    tcs.setTeachingClassId(tcId);
                    tcs.setStudentId(studentId);

                    teachingClassStudentMapper.insert(tcs);
                    successRows++;
                } catch (Exception ex) {
                    failedRows++;
                    errors.add(new ImportErrorDetail(rowIndex, "parse", "插入失败: " + ex.getMessage()));
                }
            }
        } catch (Exception e) {
            throw new BusinessException(60009, "解析选课文件失败: " + e.getMessage());
        }

        return ExcelImportResultVO.builder()
                .totalRows(totalRows)
                .successRows(successRows)
                .failedRows(failedRows)
                .errors(errors)
                .build();
    }
}
