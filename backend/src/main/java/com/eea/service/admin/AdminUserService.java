package com.eea.service.admin;

import com.eea.common.PageResult;
import com.eea.dto.*;
import com.eea.vo.UserDetailVO;

public interface AdminUserService {

    UserDetailVO createUser(CreateUserDTO dto);
    PageResult<UserDetailVO> pageUsers(UserPageDTO dto);
    UserDetailVO getUserDetail(Long userId);
    void updateUserStatus(Long userId, Integer status);
    void resetPassword(Long userId, String newPassword);

    /** §2.1 修改用户信息 */
    UserDetailVO updateUser(Long userId, UpdateUserDTO dto);

    /** §2.2 分配角色（覆盖写入） */
    void assignRoles(Long userId, AssignRolesDTO dto);

    /** §2.3 删除用户 */
    void deleteUser(Long userId);
}
