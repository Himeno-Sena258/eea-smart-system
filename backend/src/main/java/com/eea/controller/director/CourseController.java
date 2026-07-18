package com.eea.controller.director;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eea.common.BusinessException;
import com.eea.common.PageResult;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.entity.Course;
import com.eea.mapper.CourseMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "5.10 课程信息管理", description = "对应文档 §5.10：课程信息管理")
@RequireRoles({"DIRECTOR", "ADMIN", "COORDINATOR"})
public class CourseController {

    @Autowired
    private CourseMapper courseMapper;

    @GetMapping("/program-schemes/{schemeId}/courses")
    @Operation(summary = "查询方案课程", description = "按培养方案 ID 查询包含的全部课程列表")
    public Result<List<Course>> listCoursesByScheme(@PathVariable("schemeId") Long schemeId) {
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Course::getSchemeId, schemeId);
        wrapper.orderByAsc(Course::getCourseCode);
        return Result.success(courseMapper.selectList(wrapper));
    }

    @GetMapping("/courses")
    @Operation(summary = "分页查询课程", description = "支持按关键字、培养方案 ID 过滤与分页")
    public Result<PageResult<Course>> listCourses(
            @RequestParam(value = "pageNum", defaultValue = "1") Long pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") Long pageSize,
            @RequestParam(value = "schemeId", required = false) Long schemeId,
            @RequestParam(value = "keyword", required = false) String keyword) {
        Page<Course> pageParam = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
        if (schemeId != null) {
            wrapper.eq(Course::getSchemeId, schemeId);
        }
        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = keyword.trim();
            wrapper.and(w -> w.like(Course::getCourseCode, kw).or().like(Course::getCourseName, kw));
        }
        wrapper.orderByDesc(Course::getId);
        Page<Course> page = courseMapper.selectPage(pageParam, wrapper);
        return Result.success(PageResult.build(page.getRecords(), page.getCurrent(), page.getSize(), page.getTotal()));
    }

    @GetMapping("/courses/{id}")
    @Operation(summary = "获取课程详情")
    public Result<Course> getCourseDetail(@PathVariable("id") Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException(404, "课程不存在");
        }
        return Result.success(course);
    }

    @PostMapping("/courses")
    @Operation(summary = "新增课程")
    public Result<Course> createCourse(@RequestBody Course course) {
        courseMapper.insert(course);
        return Result.success(course);
    }

    @PutMapping("/courses/{id}")
    @Operation(summary = "修改课程")
    public Result<Course> updateCourse(@PathVariable("id") Long id, @RequestBody Course course) {
        course.setId(id);
        courseMapper.updateById(course);
        return Result.success(course);
    }

    @DeleteMapping("/courses/{id}")
    @Operation(summary = "删除课程")
    public Result<String> deleteCourse(@PathVariable("id") Long id) {
        courseMapper.deleteById(id);
        return Result.success("课程删除成功");
    }
}
