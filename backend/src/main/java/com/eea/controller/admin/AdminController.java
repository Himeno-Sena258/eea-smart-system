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
@Tag(name = "3.1 管理员-账号与开户管理", description = "单个用户新建开户、用户列表分页查询、账号状态开启禁用、重置密码")
@RequireRoles("ADMIN")
public class AdminController {

    @Autowired
    private AdminUserService adminUserService;

    @PostMapping("/users")
    @Operation(summary = "管理员开户 / 新建用户", description = "创建单个用户，可指定工号/学号、姓名、角色、班级等")
    public Result<UserDetailVO> createUser(@RequestBody CreateUserDTO dto) {
        UserDetailVO vo = adminUserService.createUser(dto);
        return Result.success(vo);
    }

    @GetMapping("/users")
    @Operation(summary = "分页查询用户列表", description = "支持按关键字、角色代码、组织结构过滤")
    public Result<PageResult<UserDetailVO>> pageUsers(@ParameterObject UserPageDTO dto) {
        PageResult<UserDetailVO> result = adminUserService.pageUsers(dto);
        return Result.success(result);
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "查询用户明细信息")
    public Result<UserDetailVO> getUserDetail(@PathVariable("id") Long id) {
        UserDetailVO vo = adminUserService.getUserDetail(id);
        return Result.success(vo);
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "修改账号启用 / 禁用状态")
    public Result<String> updateUserStatus(@PathVariable("id") Long id, @RequestParam("status") Integer status) {
        adminUserService.updateUserStatus(id, status);
        return Result.success(status == 1 ? "账号已启用" : "账号已禁用");
    }

    @PutMapping("/users/{id}/reset-password")
    @Operation(summary = "重置用户密码", description = "如果不传 newPassword，则默认重置为 123456")
    public Result<String> resetPassword(@PathVariable("id") Long id, @RequestParam(value = "newPassword", required = false) String newPassword) {
        adminUserService.resetPassword(id, newPassword);
        return Result.success("密码重置成功");
    }
}
