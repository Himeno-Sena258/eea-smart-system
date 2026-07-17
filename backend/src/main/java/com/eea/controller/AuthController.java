package com.eea.controller;

import com.eea.common.Result;
import com.eea.common.UserContext;
import com.eea.dto.LoginRequest;
import com.eea.service.AuthService;
import com.eea.vo.LoginVO;
import com.eea.vo.UserInfoVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "登录认证模块")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "传入 username 和 password，返回用户信息及角色列表")
    public Result<LoginVO> login(@RequestBody LoginRequest request) {
        LoginVO vo = authService.login(request);
        return Result.success(vo);
    }

    @GetMapping("/me")
    @Operation(summary = "获取当前登录用户信息", description = "解析请求头 User-Id，从数据库查询当前登录用户的详细信息")
    public Result<UserInfoVO> me() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录或登录已失效");
        }
        UserInfoVO userInfo = authService.getUserInfo(userId);
        return Result.success(userInfo);
    }

    @PostMapping("/logout")
    @Operation(summary = "退出登录", description = "用于客户端发送登出通知")
    public Result<String> logout() {
        authService.logout();
        return Result.success("已成功退出登录");
    }
}
