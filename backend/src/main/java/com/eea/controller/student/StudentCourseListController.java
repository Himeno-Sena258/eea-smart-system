package com.eea.controller.student;

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
@RequestMapping("/student")
@Tag(name = "P1-学生课程列表")
@RequireRoles("STUDENT")
public class StudentCourseListController {

    @Autowired private TeachingClassStudentMapper tcsMapper;
    @Autowired private TeachingClassMapper tcMapper;
    @Autowired private CourseMapper courseMapper;

    @GetMapping("/courses")
    @Operation(summary = "P1 我的课程列表")
    public Result<List<Map<String,Object>>> myCourses() {
        Long studentId = UserContext.getUserId();
        QueryWrapper<TeachingClassStudent> w = new QueryWrapper<>();
        w.eq("student_id", studentId);
        List<TeachingClassStudent> list = tcsMapper.selectList(w);
        List<Map<String,Object>> result = new ArrayList<>();
        for (var tcs : list) {
            TeachingClass tc = tcMapper.selectById(tcs.getTeachingClassId());
            Course c = tc != null ? courseMapper.selectById(tc.getCourseId()) : null;
            if (c != null) {
                Map<String,Object> m = new LinkedHashMap<>();
                m.put("courseId", c.getId());
                m.put("courseName", c.getCourseName());
                m.put("courseCode", c.getCourseCode());
                m.put("credits", c.getCredits());
                m.put("teachingClassId", tc.getId());
                m.put("teachingClassName", tc.getClassName());
                m.put("semester", tc.getSemester());
                result.add(m);
            }
        }
        return Result.success(result);
    }
}
