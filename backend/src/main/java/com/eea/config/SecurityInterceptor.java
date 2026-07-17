package com.eea.config;

import com.eea.common.RequireRoles;
import com.eea.common.UserContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

@SuppressWarnings("all")
@Component
public class SecurityInterceptor implements HandlerInterceptor {

    @Autowired
    private com.eea.mapper.SysUserRoleMapper sysUserRoleMapper;

    @Autowired
    private com.eea.mapper.SysRoleMapper sysRoleMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        // ① 前端在请求头中直接传入用户 ID（例如在 Header 中加上 User-Id: 101）
        String userIdStr = request.getHeader("User-Id");
        if (userIdStr == null || userIdStr.isEmpty()) {
            response.setStatus(401);
            response.getWriter().write("Unauthorized: Missing User-Id");
            return false;
        }

        Long userId = Long.parseLong(userIdStr);

        // ② 真实数据库查询：根据用户 ID 动态在数据库中获取其拥有的所有角色代码（如 STUDENT, COORDINATOR 等）
        List<String> userRoles = new java.util.ArrayList<>();
        try {
            // 1. 查询该用户在 sys_user_role 中对应的所有角色关联记录
            com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.eea.entity.SysUserRole> urWrapper = 
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
            urWrapper.eq("user_id", userId);
            List<com.eea.entity.SysUserRole> userRolesList = sysUserRoleMapper.selectList(urWrapper);
            
            if (userRolesList != null && !userRolesList.isEmpty()) {
                List<Long> roleIds = new java.util.ArrayList<>();
                for (com.eea.entity.SysUserRole ur : userRolesList) {
                    roleIds.add(ur.getRoleId());
                }
                
                // 2. 根据 roleId 列表批量查出对应的角色数据
                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.eea.entity.SysRole> roleWrapper = 
                        new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
                roleWrapper.in("id", roleIds);
                List<com.eea.entity.SysRole> roles = sysRoleMapper.selectList(roleWrapper);
                
                if (roles != null) {
                    for (com.eea.entity.SysRole role : roles) {
                        userRoles.add(role.getRoleCode()); // 收集角色代码，如 "DIRECTOR"
                    }
                }
            }
        } catch (Exception e) {
            response.setStatus(500);
            response.getWriter().write("Internal Server Error: Database access failed");
            return false;
        }

        // ③ 存入储物柜上下文
        UserContext.setUserId(userId);
        UserContext.setRoles(userRoles);

        // ④ 检查方法上的权限贴纸 @RequireRoles
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
                    response.getWriter().write("Forbidden: 您所扮演的角色无权访问该接口！");
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