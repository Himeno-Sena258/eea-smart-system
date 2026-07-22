package com.eea.controller.teacher;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.common.UserContext;
import com.eea.entity.*;
import com.eea.mapper.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/teacher")
@Tag(name = "P1-教师课程列表")
@RequireRoles("INSTRUCTOR")
public class TeacherCourseListController {

    @Autowired private TeachingClassMapper tcMapper;
    @Autowired private CourseMapper courseMapper;

    @GetMapping("/courses")
    @Operation(summary = "P1 我授课的课程列表")
    public Result<List<Map<String,Object>>> myCourses() {
        Long teacherId = UserContext.getUserId();
        QueryWrapper<TeachingClass> w = new QueryWrapper<>();
        w.eq("teacher_id", teacherId);
        List<TeachingClass> list = tcMapper.selectList(w);
        Set<Long> seen = new HashSet<>();
        List<Map<String,Object>> result = new ArrayList<>();
        for (var tc : list) {
            if (seen.contains(tc.getCourseId())) continue;
            seen.add(tc.getCourseId());
            Course c = courseMapper.selectById(tc.getCourseId());
            if (c != null) {
                Map<String,Object> m = new LinkedHashMap<>();
                m.put("id", c.getId());
                m.put("courseId", c.getId()); m.put("courseName", c.getCourseName());
                m.put("courseCode", c.getCourseCode()); m.put("credits", c.getCredits());
                m.put("teachingClassCount", list.stream().filter(t -> t.getCourseId().equals(c.getId())).count());
                result.add(m);
            }
        }
        return Result.success(result);
    }
}
