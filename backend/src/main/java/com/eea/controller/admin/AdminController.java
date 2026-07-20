package com.eea.controller.admin;

import com.eea.common.PageResult;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.dto.CreateUserDTO;
import com.eea.dto.UserPageDTO;
import com.eea.service.admin.AdminUserService;
import com.eea.vo.UserDetailVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@Tag(name = "5.03 用户管理", description = "对应文档 §5.3：用户管理")
@RequireRoles("ADMIN")
public class AdminController {

    @Autowired
    private AdminUserService adminUserService;

    @GetMapping("/users")
    @Operation(summary = "分页查询用户", description = "支持按关键字、角色代码、组织结构过滤")
    public Result<PageResult<UserDetailVO>> pageUsers(@ParameterObject UserPageDTO dto) {
        PageResult<UserDetailVO> result = adminUserService.pageUsers(dto);
        return Result.success(result);
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "获取用户详情")
    public Result<UserDetailVO> getUserDetail(@PathVariable("id") Long id) {
        UserDetailVO vo = adminUserService.getUserDetail(id);
        return Result.success(vo);
    }

    @PostMapping("/users")
    @Operation(summary = "管理员开户 / 新增用户", description = "创建单个用户，可指定工号/学号、姓名、角色、班级等")
    public Result<UserDetailVO> createUser(@RequestBody CreateUserDTO dto) {
        UserDetailVO vo = adminUserService.createUser(dto);
        return Result.success(vo);
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "启用或禁用用户")
    public Result<String> updateUserStatus(@PathVariable("id") Long id, @RequestParam("status") Integer status) {
        adminUserService.updateUserStatus(id, status);
        return Result.success(status == 1 ? "账号已启用" : "账号已禁用");
    }

    @PutMapping("/users/{id}/reset-password")
    @Operation(summary = "重置用户密码")
    public Result<String> resetPassword(
            @PathVariable("id") Long id,
            @RequestBody(required = false) com.eea.dto.ResetPasswordDTO dto) {
        String newPassword = (dto != null) ? dto.getNewPassword() : null;
        adminUserService.resetPassword(id, newPassword);
        return Result.success("密码重置成功");
    }

    // ==================== §2.1 修改用户 ====================
    @PutMapping("/users/{id}")
    @Operation(summary = "修改用户信息", description = "对应追加文档 §2.1：修改用户基础信息与角色")
    public Result<UserDetailVO> updateUser(@PathVariable("id") Long id,
                                            @RequestBody com.eea.dto.UpdateUserDTO dto) {
        return Result.success(adminUserService.updateUser(id, dto));
    }

    // ==================== §2.2 分配角色 ====================
    @PutMapping("/users/{id}/roles")
    @Operation(summary = "分配用户角色", description = "对应追加文档 §2.2：覆盖写入用户角色列表")
    public Result<String> assignRoles(@PathVariable("id") Long id,
                                       @RequestBody com.eea.dto.AssignRolesDTO dto) {
        adminUserService.assignRoles(id, dto);
        return Result.success("角色分配成功");
    }

    // ==================== §2.3 删除用户 ====================
    @DeleteMapping("/users/{id}")
    @Operation(summary = "删除用户", description = "对应追加文档 §2.3：删除用户及关联数据")
    public Result<String> deleteUser(@PathVariable("id") Long id) {
        adminUserService.deleteUser(id);
        return Result.success("用户删除成功");
    }
}
