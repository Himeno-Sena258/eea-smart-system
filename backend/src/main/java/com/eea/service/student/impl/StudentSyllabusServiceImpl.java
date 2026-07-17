package com.eea.service.student.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.BusinessException;
import com.eea.entity.*;
import com.eea.mapper.*;
import com.eea.service.student.StudentSyllabusService;
import com.eea.vo.StudentSyllabusVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentSyllabusServiceImpl implements StudentSyllabusService {

    @Autowired
    private TeachingClassStudentMapper tcsMapper;
    @Autowired
    private TeachingClassMapper tcMapper;
    @Autowired
    private CourseMapper courseMapper;
    @Autowired
    private CourseObjectiveMapper objectiveMapper;
    @Autowired
    private CourseObjIndicatorMapMapper coiMapper;
    @Autowired
    private GradIndicatorPointMapper indicatorPointMapper;
    @Autowired
    private AssessmentMethodMapper methodMapper;

    @Override
    public List<StudentSyllabusVO> listSyllabus(Long studentId) {
        // 查学生所有教学班
        QueryWrapper<TeachingClassStudent> tcsW = new QueryWrapper<>();
        tcsW.eq("student_id", studentId);
        List<TeachingClassStudent> tcsList = tcsMapper.selectList(tcsW);

        return tcsList.stream().map(tcs -> {
            TeachingClass tc = tcMapper.selectById(tcs.getTeachingClassId());
            Course course = tc != null ? courseMapper.selectById(tc.getCourseId()) : null;
            return buildSyllabusVO(course);
        }).filter(vo -> vo != null).collect(Collectors.toList());
    }

    @Override
    public StudentSyllabusVO getSyllabusDetail(Long studentId, Long courseId) {
        // 校验是否选了这门课
        QueryWrapper<TeachingClassStudent> tcsW = new QueryWrapper<>();
        tcsW.eq("student_id", studentId);
        List<TeachingClassStudent> tcsList = tcsMapper.selectList(tcsW);
        boolean enrolled = false;
        for (TeachingClassStudent tcs : tcsList) {
            TeachingClass tc = tcMapper.selectById(tcs.getTeachingClassId());
            if (tc != null && tc.getCourseId().equals(courseId)) {
                enrolled = true;
                break;
            }
        }
        if (!enrolled) {
            throw BusinessException.forbidden();
        }

        Course course = courseMapper.selectById(courseId);
        return buildSyllabusVO(course);
    }

    private StudentSyllabusVO buildSyllabusVO(Course course) {
        if (course == null) return null;

        // 课程目标
        QueryWrapper<CourseObjective> objW = new QueryWrapper<>();
        objW.eq("course_id", course.getId());
        List<CourseObjective> objectives = objectiveMapper.selectList(objW);

        List<StudentSyllabusVO.ObjectiveVO> objVOs = new ArrayList<>();
        for (CourseObjective obj : objectives) {
            // 查该目标支撑的指标点
            QueryWrapper<CourseObjIndicatorMap> coiW = new QueryWrapper<>();
            coiW.eq("course_objective_id", obj.getId());
            List<CourseObjIndicatorMap> maps = coiMapper.selectList(coiW);
            List<String> indicatorCodes = new ArrayList<>();
            for (CourseObjIndicatorMap m : maps) {
                GradIndicatorPoint ip = indicatorPointMapper.selectById(m.getIndicatorPointId());
                if (ip != null) indicatorCodes.add(ip.getCode());
            }
            objVOs.add(new StudentSyllabusVO.ObjectiveVO(obj.getObjectiveCode(), obj.getContent(), indicatorCodes));
        }

        // 考核方式
        QueryWrapper<AssessmentMethod> methodW = new QueryWrapper<>();
        methodW.eq("course_id", course.getId());
        List<AssessmentMethod> methods = methodMapper.selectList(methodW);
        List<StudentSyllabusVO.MethodVO> methodVOs = methods.stream()
                .map(m -> new StudentSyllabusVO.MethodVO(m.getName(), m.getWeight()))
                .collect(Collectors.toList());

        return new StudentSyllabusVO(course.getId(), course.getCourseName(),
                course.getCredits(), course.getHours(), objVOs, methodVOs);
    }
}
