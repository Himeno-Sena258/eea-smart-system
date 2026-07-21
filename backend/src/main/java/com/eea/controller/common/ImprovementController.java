package com.eea.controller.common;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.*;
import com.eea.entity.*;
import com.eea.mapper.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * §11 持续改进模块
 */
@RestController
@Tag(name = "11.0 持续改进", description = "班级持续改进记录 CRUD 与自动生成草稿")
public class ImprovementController {

    @Autowired private ContinuousImprovementMapper ciMapper;
    @Autowired private CourseAttainmentMapper caMapper;
    @Autowired private TeachingClassMapper teachingClassMapper;
    @Autowired private CourseMapper courseMapper;
    @Autowired private SysUserMapper sysUserMapper;

    @GetMapping("/teaching-classes/{teachingClassId}/improvements")
    @Operation(summary = "查询持续改进记录")
    public Result<List<ContinuousImprovement>> list(@PathVariable Long teachingClassId) {
        QueryWrapper<ContinuousImprovement> w = new QueryWrapper<>();
        w.eq("teaching_class_id", teachingClassId).orderByDesc("created_at");
        return Result.success(ciMapper.selectList(w));
    }

    @PostMapping("/teaching-classes/{teachingClassId}/improvements")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "新增持续改进记录")
    public Result<ContinuousImprovement> create(@PathVariable Long teachingClassId,
                                                 @RequestBody ContinuousImprovement ci) {
        ci.setTeachingClassId(teachingClassId);
        ciMapper.insert(ci);
        return Result.success(ci);
    }

    @PutMapping("/improvements/{id}")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "修改持续改进记录")
    public Result<String> update(@PathVariable Long id, @RequestBody ContinuousImprovement ci) {
        ci.setId(id);
        ciMapper.updateById(ci);
        return Result.success("修改成功");
    }

    @DeleteMapping("/improvements/{id}")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "删除持续改进记录")
    public Result<String> delete(@PathVariable Long id) {
        ciMapper.deleteById(id);
        return Result.success("删除成功");
    }

    @PostMapping("/teaching-classes/{teachingClassId}/improvements/generate")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "根据达成度结果生成分析草稿")
    public Result<Map<String, Object>> generate(@PathVariable Long teachingClassId) {
        QueryWrapper<CourseAttainment> w = new QueryWrapper<>();
        w.eq("teaching_class_id", teachingClassId);
        List<CourseAttainment> list = caMapper.selectList(w);

        List<String> lowCOs = new ArrayList<>();
        for (CourseAttainment ca : list) {
            if (ca.getAttainmentVal() != null && ca.getAttainmentVal().doubleValue() < 0.68) {
                lowCOs.add("CO" + ca.getCourseObjectiveId() + "=" + ca.getAttainmentVal());
            }
        }

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("teachingClassId", teachingClassId);
        draft.put("lowAttainmentCOs", lowCOs);
        draft.put("suggestedAnalysis", lowCOs.isEmpty()
                ? "所有课程目标达成度均在阈值(0.68)以上"
                : "以下课程目标达成度低于阈值(0.68)，建议分析原因：" + String.join(", ", lowCOs));
        return Result.success(draft);
    }

    // ===== P1: 全专业级改进聚合 (DIRECTOR) =====
    @GetMapping("/director/improvements")
    @com.eea.common.RequireRoles({"DIRECTOR","ADMIN"})
    @Operation(summary = "P1 全专业改进记录")
    public Result<List<java.util.Map<String,Object>>> directorImprovements(
            @RequestParam(required = false) Long schemeId) {
        QueryWrapper<ContinuousImprovement> w = new QueryWrapper<>();
        if (schemeId != null) {
            List<Course> courses = courseMapper.selectList(new QueryWrapper<Course>().eq("scheme_id", schemeId));
            List<Long> courseIds = courses.stream().map(Course::getId).collect(Collectors.toList());
            if (courseIds.isEmpty()) {
                return Result.success(new ArrayList<>());
            }
            List<TeachingClass> classes = teachingClassMapper.selectList(new QueryWrapper<TeachingClass>().in("course_id", courseIds));
            List<Long> classIds = classes.stream().map(TeachingClass::getId).collect(Collectors.toList());
            if (classIds.isEmpty()) {
                return Result.success(new ArrayList<>());
            }
            w.in("teaching_class_id", classIds);
        }
        w.orderByDesc("created_at");
        return Result.success(enrich(ciMapper.selectList(w)));
    }

    @GetMapping("/coordinator/improvements")
    @com.eea.common.RequireRoles({"COORDINATOR","ADMIN"})
    @Operation(summary = "P1 课程级改进记录")
    public Result<List<java.util.Map<String,Object>>> coordinatorImprovements(
            @RequestParam(required = false) Long courseId) {
        QueryWrapper<ContinuousImprovement> w = new QueryWrapper<>();
        if (courseId != null) {
            List<TeachingClass> classes = teachingClassMapper.selectList(new QueryWrapper<TeachingClass>().eq("course_id", courseId));
            List<Long> classIds = classes.stream().map(TeachingClass::getId).collect(Collectors.toList());
            if (classIds.isEmpty()) {
                return Result.success(new ArrayList<>());
            }
            w.in("teaching_class_id", classIds);
        }
        w.orderByDesc("created_at");
        return Result.success(enrich(ciMapper.selectList(w)));
    }

    private List<java.util.Map<String,Object>> enrich(List<ContinuousImprovement> list) {
        List<java.util.Map<String,Object>> r = new java.util.ArrayList<>();
        for (var ci : list) {
            var m = new java.util.LinkedHashMap<String,Object>();
            TeachingClass teachingClass = ci.getTeachingClassId() == null ? null : teachingClassMapper.selectById(ci.getTeachingClassId());
            Course course = teachingClass == null || teachingClass.getCourseId() == null ? null : courseMapper.selectById(teachingClass.getCourseId());
            SysUser teacher = teachingClass == null || teachingClass.getTeacherId() == null ? null : sysUserMapper.selectById(teachingClass.getTeacherId());
            SysUser creator = ci.getCreatedBy() == null ? null : sysUserMapper.selectById(ci.getCreatedBy());
            SysUser reviewer = ci.getReviewedBy() == null ? null : sysUserMapper.selectById(ci.getReviewedBy());

            m.put("id", ci.getId());
            m.put("teachingClassId", ci.getTeachingClassId());
            m.put("teachingClassName", teachingClass == null ? null : teachingClass.getClassName());
            m.put("courseId", course == null ? null : course.getId());
            m.put("courseName", course == null ? null : course.getCourseName());
            m.put("teacherId", teacher == null ? null : teacher.getId());
            m.put("teacherName", teacher == null ? null : teacher.getRealName());
            m.put("problemAnalysis", ci.getProblemAnalysis());
            m.put("improvementMeasures", ci.getImprovementMeasures());
            m.put("lowAttainmentCos", ci.getLowAttainmentCos());
            m.put("createdBy", ci.getCreatedBy());
            m.put("creatorName", creator == null ? null : creator.getRealName());
            m.put("createdAt", ci.getCreatedAt());
            m.put("status", ci.getStatus());
            m.put("reviewedBy", ci.getReviewedBy());
            m.put("reviewerName", reviewer == null ? null : reviewer.getRealName());
            m.put("reviewedAt", ci.getReviewedAt());
            m.put("reviewerComment", ci.getReviewerComment());
            m.put("cycleLabel", ci.getCycleLabel());
            m.put("followUpAt", ci.getFollowUpAt());
            m.put("followUpResult", ci.getFollowUpResult());
            m.put("updatedAt", ci.getUpdatedAt());
            r.add(m);
        }
        return r;
    }
}
