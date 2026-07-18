package com.eea.controller.common;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eea.common.PageResult;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.entity.TeachingClass;
import com.eea.mapper.TeachingClassMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * §8.2 教学班与课程分配
 */
@RestController
@RequestMapping("/teaching-classes")
@Tag(name = "8.2 教学班管理", description = "教学班创建、查询、修改、删除及教师分配")
public class TeachingClassController {

    @Autowired private TeachingClassMapper tcMapper;

    @GetMapping
    @Operation(summary = "分页查询教学班")
    public Result<PageResult<TeachingClass>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long teacherId) {
        QueryWrapper<TeachingClass> w = new QueryWrapper<>();
        if (courseId != null) w.eq("course_id", courseId);
        if (teacherId != null) w.eq("teacher_id", teacherId);
        Page<TeachingClass> page = tcMapper.selectPage(new Page<>(pageNum, pageSize), w);
        return Result.success(PageResult.build(page.getRecords(), page.getCurrent(), page.getSize(), page.getTotal()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取教学班详情")
    public Result<TeachingClass> getById(@PathVariable Long id) {
        return Result.success(tcMapper.selectById(id));
    }

    @PostMapping
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "创建教学班并分配教师")
    public Result<TeachingClass> create(@RequestBody TeachingClass tc) {
        tcMapper.insert(tc);
        return Result.success(tc);
    }

    @PutMapping("/{id}")
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "修改教学班")
    public Result<String> update(@PathVariable Long id, @RequestBody TeachingClass tc) {
        tc.setId(id);
        tcMapper.updateById(tc);
        return Result.success("修改成功");
    }

    @DeleteMapping("/{id}")
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "删除教学班")
    public Result<String> delete(@PathVariable Long id) {
        tcMapper.deleteById(id);
        return Result.success("删除成功");
    }
}
