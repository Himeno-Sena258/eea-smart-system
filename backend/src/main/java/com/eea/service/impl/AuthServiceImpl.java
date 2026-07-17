package com.eea.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.dto.LoginRequest;
import com.eea.entity.SysRole;
import com.eea.entity.SysUser;
import com.eea.entity.SysUserRole;
import com.eea.mapper.SysRoleMapper;
import com.eea.mapper.SysUserMapper;
import com.eea.mapper.SysUserRoleMapper;
import com.eea.service.AuthService;
import com.eea.vo.LoginVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysUserRoleMapper sysUserRoleMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public LoginVO login(LoginRequest request) {
        // 1. 查用户
        QueryWrapper<SysUser> wrapper = new QueryWrapper<>();
        wrapper.eq("username", request.getUsername());
        SysUser user = sysUserMapper.selectOne(wrapper);
        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }
        if (user.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }

        // 2. 验密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
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
}
