package com.eea.common.config;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.common.UserContext;
import com.eea.entity.SysRole;
import com.eea.entity.SysUserRole;
import com.eea.mapper.SysRoleMapper;
import com.eea.mapper.SysUserRoleMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 安全认证与 RBAC 拦截器，与 documents/状态码规范文档.md §15.1 及 §7 严格对齐
 */
@SuppressWarnings("all")
@Component
public class SecurityInterceptor implements HandlerInterceptor {

    @Autowired
    private SysUserRoleMapper sysUserRoleMapper;

    @Autowired
    private SysRoleMapper sysRoleMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        // ① 前端在请求头中传入 User-Id
        String userIdStr = request.getHeader("User-Id");
        if (userIdStr == null || userIdStr.isEmpty()) {
            response.setStatus(401);
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json;charset=utf-8");
            Result<Void> errorResult = Result.error(20001, "用户未登录");
            response.getWriter().write(objectMapper.writeValueAsString(errorResult));
            return false;
        }

        Long userId;
        try {
            userId = Long.parseLong(userIdStr);
        } catch (NumberFormatException e) {
            response.setStatus(401);
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json;charset=utf-8");
            Result<Void> errorResult = Result.error(20003, "登录状态非法");
            response.getWriter().write(objectMapper.writeValueAsString(errorResult));
            return false;
        }

        // ② 查询用户拥有的角色列表
        List<String> userRoles = new ArrayList<>();
        try {
            com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<SysUserRole> urWrapper = 
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
            urWrapper.eq("user_id", userId);
            List<SysUserRole> userRolesList = sysUserRoleMapper.selectList(urWrapper);

            if (userRolesList != null && !userRolesList.isEmpty()) {
                List<Long> roleIds = new ArrayList<>();
                for (SysUserRole ur : userRolesList) {
                    roleIds.add(ur.getRoleId());
                }

                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<SysRole> roleWrapper = 
                        new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
                roleWrapper.in("id", roleIds);
                List<SysRole> roles = sysRoleMapper.selectList(roleWrapper);

                if (roles != null) {
                    for (SysRole role : roles) {
                        userRoles.add(role.getRoleCode());
                    }
                }
            }
        } catch (Exception e) {
            response.setStatus(500);
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json;charset=utf-8");
            Result<Void> errorResult = Result.error(10000, "数据库访问失败");
            response.getWriter().write(objectMapper.writeValueAsString(errorResult));
            return false;
        }

        // ③ 存入上下文
        UserContext.setUserId(userId);
        UserContext.setRoles(userRoles);

        // ④ 检查 @RequireRoles 角色权限
        if (handler instanceof HandlerMethod handlerMethod) {
            RequireRoles requireRoles = handlerMethod.getMethodAnnotation(RequireRoles.class);
            if (requireRoles == null) {
                requireRoles = handlerMethod.getBeanType().getAnnotation(RequireRoles.class);
            }

            if (requireRoles != null) {
                String[] allowedRoles = requireRoles.value();
                boolean hasPermission = false;
                for (String role : allowedRoles) {
                    if (userRoles.contains(role)) {
                        hasPermission = true;
                        break;
                    }
                }
                if (!hasPermission) {
                    response.setStatus(403);
                    response.setCharacterEncoding("UTF-8");
                    response.setContentType("application/json;charset=utf-8");
                    Result<Void> errorResult = Result.error(20004, "无权限访问");
                    response.getWriter().write(objectMapper.writeValueAsString(errorResult));
                    return false;
                }
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }
}