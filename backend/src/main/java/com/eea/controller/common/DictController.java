package com.eea.controller.common;

import com.eea.common.Result;
import com.eea.entity.SysRole;
import com.eea.mapper.SysRoleMapper;
import com.eea.vo.RoleOptionVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dicts")
@Tag(name = "5.2 角色基础数据", description = "对应文档 §5.2：查询系统角色枚举，用于管理员开户和角色筛选下拉菜单")
public class DictController {

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @GetMapping("/roles")
    @Operation(summary = "查询系统角色枚举", description = "返回 [ { label: '系统管理员', value: 'ADMIN' }, ... ] 结构数据")
    public Result<List<RoleOptionVO>> getRoleOptions() {
        List<SysRole> roles = sysRoleMapper.selectList(null);
        List<RoleOptionVO> list = roles.stream()
                .map(r -> new RoleOptionVO(r.getRoleName(), r.getRoleCode()))
                .collect(Collectors.toList());
        return Result.success(list);
    }
}
