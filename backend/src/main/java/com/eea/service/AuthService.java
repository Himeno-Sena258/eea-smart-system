package com.eea.service;

import com.eea.dto.LoginRequest;
import com.eea.vo.LoginVO;
import com.eea.vo.UserInfoVO;

public interface AuthService {
    /**
     * 用户登录
     */
    LoginVO login(LoginRequest request);

    /**
     * 获取当前登录用户的详细信息
     */
    UserInfoVO getUserInfo(Long userId);

    /**
     * 退出登录
     */
    void logout();

    /**
     * 修改密码
     */
    void changePassword(Long userId, com.eea.dto.ChangePasswordDTO dto);
}
