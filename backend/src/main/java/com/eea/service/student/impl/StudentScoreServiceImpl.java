package com.eea.service.student.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.BusinessException;
import com.eea.entity.*;
import com.eea.mapper.*;
import com.eea.service.student.StudentScoreService;
import com.eea.vo.StudentCourseScoreVO;
import com.eea.vo.StudentScoreItemVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StudentScoreServiceImpl implements StudentScoreService {

    @Autowired
    private StudentCourseScoreMapper scsMapper;
    @Autowired
    private StudentScoreMapper studentScoreMapper;
    @Autowired
    private AssessmentItemMapper itemMapper;
    @Autowired
    private AssessmentMethodMapper methodMapper;
    @Autowired
    private CourseMapper courseMapper;
    @Autowired
    private TeachingClassMapper tcMapper;
    @Autowired
    private TeachingClassStudentMapper tcsMapper;

    @Override
    public List<StudentCourseScoreVO> listCourseScores(Long studentId) {
        QueryWrapper<StudentCourseScore> wrapper = new QueryWrapper<>();
        wrapper.eq("student_id", studentId);
        List<StudentCourseScore> list = scsMapper.selectList(wrapper);

        return list.stream().map(scs -> {
            Course course = courseMapper.selectById(scs.getCourseId());
            TeachingClass tc = tcMapper.selectById(scs.getTeachingClassId());
            return new StudentCourseScoreVO(
                    scs.getCourseId(),
                    course != null ? course.getCourseName() : "未知课程",
                    scs.getTeachingClassId(),
                    tc != null ? tc.getClassName() : "未知班级",
                    tc != null ? tc.getSemester() : "",
                    scs.getHomeworkScore(),
                    scs.getExperimentScore(),
                    scs.getExamScore(),
                    scs.getTotalScore(),
                    scs.getIsPassed() != null && scs.getIsPassed() == 1,
                    null   // 列表不填充明细
            );
        }).collect(Collectors.toList());
    }

    @Override
    public StudentCourseScoreVO getScoreDetail(Long studentId, Long teachingClassId) {
        // 校验是否该班学生
        QueryWrapper<TeachingClassStudent> tcsW = new QueryWrapper<>();
        tcsW.eq("teaching_class_id", teachingClassId).eq("student_id", studentId);
        if (!tcsMapper.exists(tcsW)) {
            throw BusinessException.forbidden();
        }

        // 取总评
        QueryWrapper<StudentCourseScore> scsW = new QueryWrapper<>();
        scsW.eq("student_id", studentId).eq("teaching_class_id", teachingClassId);
        StudentCourseScore scs = scsMapper.selectOne(scsW);

        TeachingClass tc = tcMapper.selectById(teachingClassId);
        Course course = tc != null ? courseMapper.selectById(tc.getCourseId()) : null;

        // 取所有小项得分
        // student_score JOIN assessment_item JOIN assessment_method
        QueryWrapper<StudentScore> scoreW = new QueryWrapper<>();
        scoreW.eq("student_id", studentId);
        List<StudentScore> scores = studentScoreMapper.selectList(scoreW);

        // 收集所有 assessment_item_id
        List<Long> itemIds = scores.stream().map(StudentScore::getAssessmentItemId).collect(Collectors.toList());
        if (itemIds.isEmpty()) {
            return buildVO(scs, tc, course, new ArrayList<>());
        }

        List<AssessmentItem> items = itemMapper.selectBatchIds(itemIds);
        Map<Long, AssessmentItem> itemMap = items.stream().collect(Collectors.toMap(AssessmentItem::getId, i -> i));

        List<Long> methodIds = items.stream().map(AssessmentItem::getMethodId).distinct().collect(Collectors.toList());
        List<AssessmentMethod> methods = methodMapper.selectBatchIds(methodIds);
        Map<Long, String> methodNameMap = methods.stream().collect(Collectors.toMap(AssessmentMethod::getId, AssessmentMethod::getName));

        List<StudentScoreItemVO> itemVOs = scores.stream().map(s -> {
            AssessmentItem item = itemMap.get(s.getAssessmentItemId());
            String itemName = item != null ? item.getName() : "未知项";
            String methodName = item != null ? methodNameMap.getOrDefault(item.getMethodId(), "未知方式") : "未知方式";
            String objCode = item != null ? "CO" + item.getCourseObjectiveId() : "";
            return new StudentScoreItemVO(
                    s.getAssessmentItemId(), itemName,
                    s.getActualScore(),
                    item != null ? item.getMaxScore() : null,
                    objCode, methodName
            );
        }).collect(Collectors.toList());

        return buildVO(scs, tc, course, itemVOs);
    }

    private StudentCourseScoreVO buildVO(StudentCourseScore scs, TeachingClass tc, Course course,
                                          List<StudentScoreItemVO> items) {
        return new StudentCourseScoreVO(
                tc != null ? tc.getCourseId() : null,
                course != null ? course.getCourseName() : "未知课程",
                tc != null ? tc.getId() : null,
                tc != null ? tc.getClassName() : "未知班级",
                tc != null ? tc.getSemester() : "",
                scs != null ? scs.getHomeworkScore() : null,
                scs != null ? scs.getExperimentScore() : null,
                scs != null ? scs.getExamScore() : null,
                scs != null ? scs.getTotalScore() : null,
                scs != null && scs.getIsPassed() != null && scs.getIsPassed() == 1,
                items
        );
    }
}
