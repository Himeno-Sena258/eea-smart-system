package com.eea.controller.common;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.*;
import com.eea.entity.CourseResource;
import com.eea.mapper.CourseResourceMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@Tag(name="课程资源管理")
public class CourseResourceController {
    @Autowired private CourseResourceMapper mapper;

    @GetMapping("/courses/{courseId}/resources")
    @Operation(summary="§2.1 课程资源列表")
    public Result<List<CourseResource>> list(@PathVariable Long courseId) {
        QueryWrapper<CourseResource> w=new QueryWrapper<>();
        w.eq("course_id",courseId).orderByDesc("uploaded_at");
        return Result.success(mapper.selectList(w));
    }

    @PostMapping("/courses/{courseId}/resources")
    @RequireRoles({"COORDINATOR","ADMIN"})
    @Operation(summary="§2.1 上传课程资源")
    public Result<CourseResource> upload(@PathVariable Long courseId,@RequestBody CourseResource r) {
        r.setCourseId(courseId); mapper.insert(r); return Result.success(r);
    }

    @PutMapping("/course-resources/{id}")
    @RequireRoles({"COORDINATOR","ADMIN"})
    @Operation(summary="§2.1 更新资源信息")
    public Result<String> update(@PathVariable Long id,@RequestBody CourseResource r) {
        r.setId(id); mapper.updateById(r); return Result.success("更新成功");
    }

    @DeleteMapping("/course-resources/{id}")
    @RequireRoles({"COORDINATOR","ADMIN"})
    @Operation(summary="§2.1 删除资源")
    public Result<String> delete(@PathVariable Long id) {
        mapper.deleteById(id); return Result.success("删除成功");
    }

    @GetMapping("/course-resources/{id}/download")
    @Operation(summary="§2.1 下载课程资源")
    public Result<Map<String,String>> download(@PathVariable Long id) {
        CourseResource r=mapper.selectById(id);
        Map<String,String> m=new LinkedHashMap<>();
        m.put("filePath",r!=null?r.getFilePath():"");
        m.put("fileName",r!=null?r.getFileName():"");
        return Result.success(m);
    }
}
