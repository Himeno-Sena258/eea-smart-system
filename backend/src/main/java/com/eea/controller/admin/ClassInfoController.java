package com.eea.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eea.common.BusinessException;
import com.eea.common.PageResult;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.entity.ClassInfo;
import com.eea.mapper.ClassInfoMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/classes")
@Tag(name = "5.04 行政班级管理", description = "对应文档 §5.4：行政班级的增删改查与列表分页查询")
@RequireRoles("ADMIN")
public class ClassInfoController {

    @Autowired
    private ClassInfoMapper classInfoMapper;

    @GetMapping
    @Operation(summary = "分页查询行政班列表")
    public Result<PageResult<ClassInfo>> listClasses(
            @RequestParam(value = "pageNum", defaultValue = "1") Long pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") Long pageSize,
            @RequestParam(value = "majorId", required = false) Long majorId) {
        Page<ClassInfo> pageParam = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ClassInfo> wrapper = new LambdaQueryWrapper<>();
        if (majorId != null) {
            wrapper.eq(ClassInfo::getMajorId, majorId);
        }
        wrapper.orderByDesc(ClassInfo::getId);
        Page<ClassInfo> page = classInfoMapper.selectPage(pageParam, wrapper);
        return Result.success(PageResult.build(page.getRecords(), page.getCurrent(), page.getSize(), page.getTotal()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取行政班详情")
    public Result<ClassInfo> getClassDetail(@PathVariable("id") Long id) {
        ClassInfo info = classInfoMapper.selectById(id);
        if (info == null) {
            throw new BusinessException(404, "行政班级不存在");
        }
        return Result.success(info);
    }

    @PostMapping
    @Operation(summary = "新增行政班")
    public Result<ClassInfo> createClass(@RequestBody ClassInfo classInfo) {
        classInfoMapper.insert(classInfo);
        return Result.success(classInfo);
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改行政班")
    public Result<ClassInfo> updateClass(@PathVariable("id") Long id, @RequestBody ClassInfo classInfo) {
        classInfo.setId(id);
        classInfoMapper.updateById(classInfo);
        return Result.success(classInfo);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除行政班")
    public Result<String> deleteClass(@PathVariable("id") Long id) {
        classInfoMapper.deleteById(id);
        return Result.success("行政班级删除成功");
    }
}
