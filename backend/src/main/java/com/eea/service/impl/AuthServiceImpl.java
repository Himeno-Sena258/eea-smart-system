package com.eea.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.BusinessException;
import com.eea.dto.LoginRequest;
import com.eea.entity.SysOrganization;
import com.eea.entity.SysRole;
import com.eea.entity.SysUser;
import com.eea.entity.SysUserRole;
import com.eea.mapper.SysOrganizationMapper;
import com.eea.mapper.SysRoleMapper;
import com.eea.mapper.SysUserMapper;
import com.eea.mapper.SysUserRoleMapper;
import com.eea.service.AuthService;
import com.eea.vo.LoginVO;
import com.eea.vo.UserInfoVO;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysUserRoleMapper sysUserRoleMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Autowired
    private SysOrganizationMapper sysOrganizationMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public LoginVO login(LoginRequest request) {
        // 1. 查用户
        QueryWrapper<SysUser> wrapper = new QueryWrapper<>();
        wrapper.eq("username", request.getUsername());
        SysUser user = sysUserMapper.selectOne(wrapper);
        if (user == null) {
            throw BusinessException.wrongPassword();
        }
        if (user.getStatus() == 0) {
            throw BusinessException.accountDisabled();
        }

        // 2. 验密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw BusinessException.wrongPassword();
        }

        // 3. 查角色
        QueryWrapper<SysUserRole> urWrapper = new QueryWrapper<>();
        urWrapper.eq("user_id", user.getId());
        List<SysUserRole> userRoles = sysUserRoleMapper.selectList(urWrapper);

        List<String> roleCodes = new ArrayList<>();
        if (userRoles != null) {
            for (SysUserRole ur : userRoles) {
                SysRole role = sysRoleMapper.selectById(ur.getRoleId());
                if (role != null) {
                    roleCodes.add(role.getRoleCode());
                }
            }
        }

        // 4. 返回
        return new LoginVO(user.getId(), user.getUsername(), user.getRealName(), roleCodes);
    }

    @Override
    public UserInfoVO getUserInfo(Long userId) {
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(50001, "数据不存在: 用户不存在");
        }

        // 查询组织名称
        String orgName = null;
        if (user.getOrgId() != null) {
            SysOrganization org = sysOrganizationMapper.selectById(user.getOrgId());
            if (org != null) {
                orgName = org.getName();
            }
        }

        // 查询角色列表
        QueryWrapper<SysUserRole> urWrapper = new QueryWrapper<>();
        urWrapper.eq("user_id", user.getId());
        List<SysUserRole> userRoles = sysUserRoleMapper.selectList(urWrapper);

        List<String> roleCodes = new ArrayList<>();
        List<String> roleNames = new ArrayList<>();

        if (userRoles != null) {
            for (SysUserRole ur : userRoles) {
                SysRole role = sysRoleMapper.selectById(ur.getRoleId());
                if (role != null) {
                    roleCodes.add(role.getRoleCode());
                    roleNames.add(role.getRoleName());
                }
            }
        }

        return UserInfoVO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .realName(user.getRealName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .orgId(user.getOrgId())
                .orgName(orgName)
                .roleCodes(roleCodes)
                .roleNames(roleNames)
                .build();
    }

    @Override
    public void logout() {
        // 基于 Header / Session 的模式下，登出由前端清除本地状态和 Header 即可
    }

    @Override
    public void changePassword(Long userId, com.eea.dto.ChangePasswordDTO dto) {
        if (dto == null) {
            throw new BusinessException(30002, "请求参数不能为空");
        }
        if (dto.getConfirmPassword() != null && !dto.getConfirmPassword().equals(dto.getNewPassword())) {
            throw new BusinessException(30002, "两次输入的新密码不一致");
        }
        SysUser user = sysUserMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(20002, "用户不存在");
        }
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPassword())) {
            throw new BusinessException(20007, "原密码错误");
        }
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        sysUserMapper.updateById(user);
    }
}
