package com.eea.service.admin;

import com.eea.common.PageResult;
import com.eea.dto.CreateUserDTO;
import com.eea.dto.UserPageDTO;
import com.eea.vo.UserDetailVO;

public interface AdminUserService {

    /**
     * 管理员开户创建新用户
     */
    UserDetailVO createUser(CreateUserDTO dto);

    /**
     * 分页查询用户列表
     */
    PageResult<UserDetailVO> pageUsers(UserPageDTO dto);

    /**
     * 获取用户详细信息
     */
    UserDetailVO getUserDetail(Long userId);

    /**
     * 启用 / 禁用用户账号
     */
    void updateUserStatus(Long userId, Integer status);

    /**
     * 重置用户密码
     */
    void resetPassword(Long userId, String newPassword);
}
