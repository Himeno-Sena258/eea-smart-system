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
@Tag(name = "4.0 认证与用户会话模块", description = "对应文档 §4：用户登录认证、会话及修改密码")
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

    @PutMapping("/password")
    @Operation(summary = "修改密码", description = "当前登录用户修改自身密码")
    public Result<String> changePassword(@RequestBody com.eea.dto.ChangePasswordDTO dto) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录或登录已失效");
        }
        authService.changePassword(userId, dto);
        return Result.success("密码修改成功");
    }

    @PutMapping("/me")
    @Operation(summary = "修改个人资料", description = "当前用户修改自己的邮箱和手机号")
    public Result<String> updateProfile(@RequestBody com.eea.dto.UpdateProfileDTO dto) {
        Long userId = UserContext.getUserId();
        if (userId == null) return Result.error(401, "未登录");
        authService.updateProfile(userId, dto);
        return Result.success("个人资料修改成功");
    }

    // ===== P2: 头像 =====
    @Autowired private com.eea.mapper.SysUserMapper sysUserMapper;

    @PostMapping("/me/avatar")
    @Operation(summary = "上传头像", description = "上传头像图片，返回头像URL")
    public Result<String> uploadAvatar(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        Long userId = UserContext.getUserId();
        String url = "/uploads/avatar/" + userId + "_" + System.currentTimeMillis() + ".png";
        var user = sysUserMapper.selectById(userId);
        if (user != null) { user.setAvatarUrl(url); sysUserMapper.updateById(user); }
        return Result.success(url);
    }

    @DeleteMapping("/me/avatar")
    @Operation(summary = "删除头像")
    public Result<String> deleteAvatar() {
        Long userId = UserContext.getUserId();
        var user = sysUserMapper.selectById(userId);
        if (user != null) { user.setAvatarUrl(null); sysUserMapper.updateById(user); }
        return Result.success("头像已删除");
    }
}
