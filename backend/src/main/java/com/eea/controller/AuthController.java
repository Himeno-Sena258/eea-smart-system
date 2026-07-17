package com.eea.controller;

import com.eea.common.Result;
import com.eea.dto.LoginRequest;
import com.eea.service.AuthService;
import com.eea.vo.LoginVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "登录认证")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "传入 username 和 password，返回用户信息和角色列表")
    public Result<LoginVO> login(@RequestBody LoginRequest request) {
        try {
            LoginVO vo = authService.login(request);
            return Result.success(vo);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
