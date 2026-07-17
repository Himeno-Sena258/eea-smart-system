package com.eea.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eea.common.BusinessException;
import com.eea.common.PageResult;
import com.eea.dto.CreateUserDTO;
import com.eea.dto.UserPageDTO;
import com.eea.entity.ClassInfo;
import com.eea.entity.StudentInfo;
import com.eea.entity.SysOrganization;
import com.eea.entity.SysRole;
import com.eea.entity.SysUser;
import com.eea.entity.SysUserRole;
import com.eea.mapper.ClassInfoMapper;
import com.eea.mapper.StudentInfoMapper;
import com.eea.mapper.SysOrganizationMapper;
import com.eea.mapper.SysRoleMapper;
import com.eea.mapper.SysUserMapper;
import com.eea.mapper.SysUserRoleMapper;
import com.eea.service.admin.AdminUserService;
import com.eea.vo.UserDetailVO;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Autowired
    private SysUserRoleMapper sysUserRoleMapper;

    @Autowired
    private SysOrganizationMapper sysOrganizationMapper;

    @Autowired
    private ClassInfoMapper classInfoMapper;

    @Autowired
    private StudentInfoMapper studentInfoMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserDetailVO createUser(CreateUserDTO dto) {
        // 1. 校验账号唯一性
        QueryWrapper<SysUser> checkWrapper = new QueryWrapper<>();
        checkWrapper.eq("username", dto.getUsername());
        if (sysUserMapper.selectCount(checkWrapper) > 0) {
            throw new BusinessException(40010, "账号/工号/学号已存在");
        }

        // 2. 初始密码设定
        String rawPassword = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty())
                ? dto.getPassword().trim()
                : "123456";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // 3. 插入 sys_user 基础记录
        SysUser user = SysUser.builder()
                .username(dto.getUsername())
                .password(encodedPassword)
                .realName(dto.getRealName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .status(1) // 默认启用
                .orgId(dto.getOrgId())
                .build();
        sysUserMapper.insert(user);

        // 4. 绑定角色 sys_user_role
        if (dto.getRoleCodes() != null && !dto.getRoleCodes().isEmpty()) {
            for (String roleCode : dto.getRoleCodes()) {
                QueryWrapper<SysRole> roleWrapper = new QueryWrapper<>();
                roleWrapper.eq("role_code", roleCode);
                SysRole role = sysRoleMapper.selectOne(roleWrapper);
                if (role != null) {
                    SysUserRole userRole = new SysUserRole(user.getId(), role.getId());
                    sysUserRoleMapper.insert(userRole);
                }
            }
        }

        // 5. 如果包含 STUDENT 角色，向 student_info 写入拓展记录
        if (dto.getRoleCodes() != null && dto.getRoleCodes().contains("STUDENT")) {
            if (dto.getStudentNo() == null || dto.getClassId() == null) {
                throw new BusinessException(40011, "学生开户必须传入学号和行政班级ID");
            }
            StudentInfo studentInfo = new StudentInfo();
            studentInfo.setUserId(user.getId());
            studentInfo.setStudentNo(dto.getStudentNo());
            studentInfo.setClassId(dto.getClassId());
            studentInfoMapper.insert(studentInfo);
        }

        return getUserDetail(user.getId());
    }

    @Override
    public PageResult<UserDetailVO> pageUsers(UserPageDTO dto) {
        Page<SysUser> pageParam = new Page<>(dto.getPageNum(), dto.getPageSize());
        QueryWrapper<SysUser> wrapper = new QueryWrapper<>();

        if (dto.getKeyword() != null && !dto.getKeyword().trim().isEmpty()) {
            String kw = dto.getKeyword().trim();
            wrapper.and(w -> w.like("username", kw).or().like("real_name", kw));
        }

        if (dto.getOrgId() != null) {
            wrapper.eq("org_id", dto.getOrgId());
        }

        wrapper.orderByDesc("id");
        Page<SysUser> page = sysUserMapper.selectPage(pageParam, wrapper);

        List<UserDetailVO> voList = new ArrayList<>();
        for (SysUser user : page.getRecords()) {
            UserDetailVO vo = getUserDetail(user.getId());
            // 如果指定了 roleCode 筛选
            if (dto.getRoleCode() != null && !dto.getRoleCode().trim().isEmpty()) {
                if (vo.getRoleCodes() != null && vo.getRoleCodes().contains(dto.getRoleCode().trim())) {
                    voList.add(vo);
                }
            } else {
                voList.add(vo);
            }
        }

        return PageResult.build(voList, page.getCurrent(), page.getSize(), page.getTotal());
    }

    @Override
    public UserDetailVO getUserDetail(Long userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "未找到该用户");
        }

        // 查询组织名称
        String orgName = null;
        if (user.getOrgId() != null) {
            SysOrganization org = sysOrganizationMapper.selectById(user.getOrgId());
            if (org != null) {
                orgName = org.getName();
            }
        }

        // 查询角色
        QueryWrapper<SysUserRole> urWrapper = new QueryWrapper<>();
        urWrapper.eq("user_id", user.getId());
        List<SysUserRole> urList = sysUserRoleMapper.selectList(urWrapper);

        List<String> roleCodes = new ArrayList<>();
        List<String> roleNames = new ArrayList<>();
        if (urList != null) {
            for (SysUserRole ur : urList) {
                SysRole role = sysRoleMapper.selectById(ur.getRoleId());
                if (role != null) {
                    roleCodes.add(role.getRoleCode());
                    roleNames.add(role.getRoleName());
                }
            }
        }

        // 查询学生扩展信息
        String studentNo = null;
        Long classId = null;
        String className = null;
        if (roleCodes.contains("STUDENT")) {
            StudentInfo studentInfo = studentInfoMapper.selectById(user.getId());
            if (studentInfo != null) {
                studentNo = studentInfo.getStudentNo();
                classId = studentInfo.getClassId();
                if (classId != null) {
                    ClassInfo classInfo = classInfoMapper.selectById(classId);
                    if (classInfo != null) {
                        className = classInfo.getClassName();
                    }
                }
            }
        }

        return UserDetailVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .orgId(user.getOrgId())
                .orgName(orgName)
                .roleCodes(roleCodes)
                .roleNames(roleNames)
                .studentNo(studentNo)
                .classId(classId)
                .className(className)
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUserStatus(Long userId, Integer status) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "未找到该用户");
        }
        user.setStatus(status);
        sysUserMapper.updateById(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resetPassword(Long userId, String newPassword) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "未找到该用户");
        }
        String pwd = (newPassword != null && !newPassword.trim().isEmpty()) ? newPassword.trim() : "123456";
        user.setPassword(passwordEncoder.encode(pwd));
        sysUserMapper.updateById(user);
    }
}
