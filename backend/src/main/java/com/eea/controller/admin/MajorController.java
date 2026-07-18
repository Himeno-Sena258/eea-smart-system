package com.eea.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eea.common.BusinessException;
import com.eea.common.PageResult;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.entity.SysOrganization;
import com.eea.mapper.SysOrganizationMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/majors")
@Tag(name = "5.05 专业信息管理", description = "对应文档 §5.5：专业信息的增删改查与列表分页查询")
@RequireRoles("ADMIN")
public class MajorController {

    @Autowired
    private SysOrganizationMapper sysOrganizationMapper;

    @GetMapping
    @Operation(summary = "分页查询专业列表")
    public Result<PageResult<SysOrganization>> listMajors(
            @RequestParam(value = "pageNum", defaultValue = "1") Long pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") Long pageSize,
            @RequestParam(value = "collegeId", required = false) Long collegeId) {
        Page<SysOrganization> pageParam = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysOrganization> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysOrganization::getType, "MAJOR");
        if (collegeId != null) {
            wrapper.eq(SysOrganization::getParentId, collegeId);
        }
        wrapper.orderByDesc(SysOrganization::getId);
        Page<SysOrganization> page = sysOrganizationMapper.selectPage(pageParam, wrapper);
        return Result.success(PageResult.build(page.getRecords(), page.getCurrent(), page.getSize(), page.getTotal()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取专业详情")
    public Result<SysOrganization> getMajorDetail(@PathVariable("id") Long id) {
        SysOrganization org = sysOrganizationMapper.selectById(id);
        if (org == null || !"MAJOR".equalsIgnoreCase(org.getType())) {
            throw new BusinessException(404, "未找到该专业节点");
        }
        return Result.success(org);
    }

    @PostMapping
    @Operation(summary = "新增专业")
    public Result<SysOrganization> createMajor(@RequestBody SysOrganization org) {
        org.setType("MAJOR");
        sysOrganizationMapper.insert(org);
        return Result.success(org);
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改专业")
    public Result<SysOrganization> updateMajor(@PathVariable("id") Long id, @RequestBody SysOrganization org) {
        org.setId(id);
        org.setType("MAJOR");
        sysOrganizationMapper.updateById(org);
        return Result.success(org);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除专业")
    public Result<String> deleteMajor(@PathVariable("id") Long id) {
        sysOrganizationMapper.deleteById(id);
        return Result.success("专业节点删除成功");
    }
}
