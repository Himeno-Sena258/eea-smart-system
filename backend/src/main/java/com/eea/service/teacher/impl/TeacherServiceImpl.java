package com.eea.service.teacher.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eea.common.BusinessException;
import com.eea.dto.BatchScoreInputDTO;
import com.eea.dto.SaveImprovementDTO;
import com.eea.dto.UploadSampleDTO;
import com.eea.entity.*;
import com.eea.mapper.*;
import com.eea.service.teacher.TeacherService;
import com.eea.vo.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherServiceImpl implements TeacherService {

    @Autowired
    private TeachingClassMapper teachingClassMapper;

    @Autowired
    private TeachingClassStudentMapper teachingClassStudentMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private ClassInfoMapper classInfoMapper;

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private AssessmentMethodMapper assessmentMethodMapper;

    @Autowired
    private AssessmentItemMapper assessmentItemMapper;

    @Autowired
    private CourseObjectiveMapper courseObjectiveMapper;

    @Autowired
    private CourseObjIndicatorMapMapper courseObjIndicatorMapMapper;

    @Autowired
    private GradIndicatorPointMapper gradIndicatorPointMapper;

    @Autowired
    private StudentScoreMapper studentScoreMapper;

    @Autowired
    private StudentCourseScoreMapper studentCourseScoreMapper;

    @Autowired
    private CourseAttainmentMapper courseAttainmentMapper;

    @Autowired
    private ContinuousImprovementMapper continuousImprovementMapper;

    @Autowired
    private EvidenceMaterialMapper evidenceMaterialMapper;

    // -------------------------------------------------------------------------
    // 4.1 授课班级学生花名册
    // -------------------------------------------------------------------------
    @Override
    public List<TeacherClassVO> listTeacherClasses(Long teacherId) {
        LambdaQueryWrapper<TeachingClass> qw = new LambdaQueryWrapper<>();
        if (teacherId != null && teacherId != 100L) { // 100 为超级管理员，看全部
            qw.eq(TeachingClass::getTeacherId, teacherId);
        }
        List<TeachingClass> classes = teachingClassMapper.selectList(qw);

        return classes.stream().map(tc -> {
            TeacherClassVO vo = new TeacherClassVO();
            vo.setClassId(tc.getId());
            vo.setClassName(tc.getClassName());
            vo.setCourseId(tc.getCourseId());
            vo.setSemester(tc.getSemester());

            Course course = courseMapper.selectById(tc.getCourseId());
            vo.setCourseName(course != null ? course.getCourseName() : "未知课程");

            Long count = teachingClassStudentMapper.selectCount(
                    new LambdaQueryWrapper<TeachingClassStudent>().eq(TeachingClassStudent::getTeachingClassId, tc.getId())
            );
            vo.setStudentCount(count.intValue());
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public List<TeacherClassStudentVO> listClassStudents(Long teacherId, Long classId) {
        TeachingClass tc = teachingClassMapper.selectById(classId);
        if (tc == null) {
            throw new BusinessException(50001, "教学班不存在");
        }
        Course course = courseMapper.selectById(tc.getCourseId());
        String courseName = course != null ? course.getCourseName() : "";

        List<TeachingClassStudent> rels = teachingClassStudentMapper.selectList(
                new LambdaQueryWrapper<TeachingClassStudent>().eq(TeachingClassStudent::getTeachingClassId, classId)
        );

        return rels.stream().map(rel -> {
            TeacherClassStudentVO vo = new TeacherClassStudentVO();
            vo.setStudentId(rel.getStudentId());
            vo.setSemester(tc.getSemester());
            vo.setCourseName(courseName);
            vo.setSelectStatus(1);

            SysUser stu = sysUserMapper.selectById(rel.getStudentId());
            if (stu != null) {
                vo.setStudentNo(stu.getUsername());
                vo.setStudentName(stu.getRealName());
                if (stu.getOrgId() != null) {
                    ClassInfo ci = classInfoMapper.selectById(stu.getOrgId());
                    vo.setAdminClassName(ci != null ? ci.getClassName() : "未知行政班");
                }
            }
            return vo;
        }).collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // 4.2 细项成绩网格表与防超满分批量录入
    // -------------------------------------------------------------------------
    @Override
    public TeacherScoreGridVO getScoreGrid(Long teacherId, Long classId) {
        TeachingClass tc = teachingClassMapper.selectById(classId);
        if (tc == null) {
            throw new BusinessException(50001, "教学班不存在");
        }

        // 查考核方式与细小项
        List<AssessmentMethod> methods = assessmentMethodMapper.selectList(
                new LambdaQueryWrapper<AssessmentMethod>().eq(AssessmentMethod::getCourseId, tc.getCourseId())
        );

        List<ScoreGridHeaderVO> headers = new ArrayList<>();
        for (AssessmentMethod m : methods) {
            List<AssessmentItem> items = assessmentItemMapper.selectList(
                    new LambdaQueryWrapper<AssessmentItem>().eq(AssessmentItem::getMethodId, m.getId())
            );
            for (AssessmentItem item : items) {
                ScoreGridHeaderVO h = new ScoreGridHeaderVO();
                h.setItemId(item.getId());
                h.setItemName(item.getName());
                h.setMaxScore(item.getMaxScore());
                h.setCoId(item.getCourseObjectiveId());
                h.setMethodName(m.getName());
                h.setMethodWeight(m.getWeight());

                CourseObjective co = courseObjectiveMapper.selectById(item.getCourseObjectiveId());
                h.setCoCode(co != null ? co.getObjectiveCode() : "CO");
                headers.add(h);
            }
        }

        // 查全班学生及得分记录
        List<TeacherClassStudentVO> students = listClassStudents(teacherId, classId);
        List<ScoreGridRowVO> rows = new ArrayList<>();

        for (TeacherClassStudentVO stu : students) {
            ScoreGridRowVO row = new ScoreGridRowVO();
            row.setStudentId(stu.getStudentId());
            row.setStudentNo(stu.getStudentNo());
            row.setStudentName(stu.getStudentName());

            List<StudentScore> scores = studentScoreMapper.selectList(
                    new LambdaQueryWrapper<StudentScore>()
                            .eq(StudentScore::getTeachingClassId, classId)
                            .eq(StudentScore::getStudentId, stu.getStudentId())
            );

            Map<Long, BigDecimal> itemMap = new HashMap<>();
            for (StudentScore s : scores) {
                itemMap.put(s.getAssessmentItemId(), s.getActualScore());
            }
            row.setItemScores(itemMap);
            rows.add(row);
        }

        TeacherScoreGridVO gridVO = new TeacherScoreGridVO();
        gridVO.setClassId(classId);
        gridVO.setHeaders(headers);
        gridVO.setRows(rows);
        return gridVO;
    }

    @Override
    @Transactional
    public void batchSaveScores(Long teacherId, Long classId, BatchScoreInputDTO dto) {
        if (dto == null || dto.getScores() == null || dto.getScores().isEmpty()) {
            throw new BusinessException(30002, "提交的数据不能为空");
        }

        for (BatchScoreInputDTO.SingleScoreItem s : dto.getScores()) {
            AssessmentItem item = assessmentItemMapper.selectById(s.getAssessmentItemId());
            if (item == null) {
                throw new BusinessException(50001, "考核细项不存在 ID: " + s.getAssessmentItemId());
            }

            // 防超满分及负分校验
            if (s.getActualScore() != null) {
                if (s.getActualScore().compareTo(BigDecimal.ZERO) < 0) {
                    throw new BusinessException(30002, "学生得分不能为负数: " + s.getActualScore());
                }
                if (s.getActualScore().compareTo(item.getMaxScore()) > 0) {
                    throw new BusinessException(30002, "学生得分(" + s.getActualScore() + ")不可超过细项满分(" + item.getMaxScore() + ")");
                }
            }

            // 存在则更新，不存在则插入
            StudentScore exist = studentScoreMapper.selectOne(
                    new LambdaQueryWrapper<StudentScore>()
                            .eq(StudentScore::getStudentId, s.getStudentId())
                            .eq(StudentScore::getAssessmentItemId, s.getAssessmentItemId())
            );

            if (exist != null) {
                exist.setActualScore(s.getActualScore());
                studentScoreMapper.updateById(exist);
            } else {
                StudentScore newScore = new StudentScore();
                newScore.setStudentId(s.getStudentId());
                newScore.setTeachingClassId(classId);
                newScore.setAssessmentItemId(s.getAssessmentItemId());
                newScore.setActualScore(s.getActualScore());
                studentScoreMapper.insert(newScore);
            }
        }
    }

    // -------------------------------------------------------------------------
    // 4.3 班级总评成绩单表 (按权重算法自动计算总评并存入 student_course_score)
    // -------------------------------------------------------------------------
    @Override
    @Transactional
    public List<TeacherFinalScoreVO> calculateAndListFinalScores(Long teacherId, Long classId) {
        TeachingClass tc = teachingClassMapper.selectById(classId);
        if (tc == null) {
            throw new BusinessException(50001, "教学班不存在");
        }

        List<AssessmentMethod> methods = assessmentMethodMapper.selectList(
                new LambdaQueryWrapper<AssessmentMethod>().eq(AssessmentMethod::getCourseId, tc.getCourseId())
        );

        List<TeacherClassStudentVO> students = listClassStudents(teacherId, classId);
        List<TeacherFinalScoreVO> resultList = new ArrayList<>();

        for (TeacherClassStudentVO stu : students) {
            BigDecimal homeworkTotal = BigDecimal.ZERO;
            BigDecimal experimentTotal = BigDecimal.ZERO;
            BigDecimal examTotal = BigDecimal.ZERO;

            BigDecimal totalScore = BigDecimal.ZERO;

            for (AssessmentMethod m : methods) {
                List<AssessmentItem> items = assessmentItemMapper.selectList(
                        new LambdaQueryWrapper<AssessmentItem>().eq(AssessmentItem::getMethodId, m.getId())
                );
                if (items.isEmpty()) continue;

                BigDecimal methodMaxSum = items.stream().map(AssessmentItem::getMaxScore).reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal methodActualSum = BigDecimal.ZERO;

                for (AssessmentItem item : items) {
                    StudentScore ss = studentScoreMapper.selectOne(
                            new LambdaQueryWrapper<StudentScore>()
                                    .eq(StudentScore::getStudentId, stu.getStudentId())
                                    .eq(StudentScore::getAssessmentItemId, item.getId())
                    );
                    if (ss != null && ss.getActualScore() != null) {
                        methodActualSum = methodActualSum.add(ss.getActualScore());
                    }
                }

                BigDecimal scaledMethodScore = methodMaxSum.compareTo(BigDecimal.ZERO) > 0
                        ? methodActualSum.divide(methodMaxSum, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                        : BigDecimal.ZERO;

                String mName = m.getName() != null ? m.getName() : "";
                if (mName.contains("作业") || mName.contains("平时")) {
                    homeworkTotal = scaledMethodScore;
                } else if (mName.contains("实验")) {
                    experimentTotal = scaledMethodScore;
                } else if (mName.contains("期末") || mName.contains("考试")) {
                    examTotal = scaledMethodScore;
                }

                // 累加总评：按考核方式权重占比折算
                BigDecimal weightedScore = scaledMethodScore.multiply(m.getWeight());
                totalScore = totalScore.add(weightedScore);
            }

            totalScore = totalScore.setScale(2, RoundingMode.HALF_UP);
            int isPassed = (totalScore.compareTo(new BigDecimal("60.00")) >= 0) ? 1 : 0;

            // 写入/更新 student_course_score
            StudentCourseScore scs = studentCourseScoreMapper.selectOne(
                    new LambdaQueryWrapper<StudentCourseScore>()
                            .eq(StudentCourseScore::getStudentId, stu.getStudentId())
                            .eq(StudentCourseScore::getTeachingClassId, classId)
            );
            if (scs == null) {
                scs = new StudentCourseScore();
                scs.setStudentId(stu.getStudentId());
                scs.setCourseId(tc.getCourseId());
                scs.setTeachingClassId(classId);
            }
            scs.setHomeworkScore(homeworkTotal.setScale(2, RoundingMode.HALF_UP));
            scs.setExperimentScore(experimentTotal.setScale(2, RoundingMode.HALF_UP));
            scs.setExamScore(examTotal.setScale(2, RoundingMode.HALF_UP));
            scs.setTotalScore(totalScore);
            scs.setIsPassed(isPassed);

            if (scs.getId() == null) {
                studentCourseScoreMapper.insert(scs);
            } else {
                studentCourseScoreMapper.updateById(scs);
            }

            TeacherFinalScoreVO vo = new TeacherFinalScoreVO();
            vo.setStudentId(stu.getStudentId());
            vo.setStudentNo(stu.getStudentNo());
            vo.setStudentName(stu.getStudentName());
            vo.setHomeworkScore(scs.getHomeworkScore());
            vo.setExperimentScore(scs.getExperimentScore());
            vo.setExamScore(scs.getExamScore());
            vo.setTotalScore(scs.getTotalScore());
            vo.setIsPassed(scs.getIsPassed());
            resultList.add(vo);
        }

        return resultList;
    }

    // -------------------------------------------------------------------------
    // 4.4 班级 CO 达成度一键计算引擎 A(COk)
    // Formula: A(COk) = Σ(Wm * Savg,m) / Σ(Wm * Smax,m)
    // -------------------------------------------------------------------------
    @Override
    @Transactional
    public List<TeacherCoAttainmentVO> calculateCoAttainment(Long teacherId, Long classId) {
        TeachingClass tc = teachingClassMapper.selectById(classId);
        if (tc == null) {
            throw new BusinessException(50001, "教学班不存在");
        }

        List<CourseObjective> cos = courseObjectiveMapper.selectList(
                new LambdaQueryWrapper<CourseObjective>().eq(CourseObjective::getCourseId, tc.getCourseId())
        );

        List<TeacherClassStudentVO> students = listClassStudents(teacherId, classId);
        int studentCount = students.size();
        List<TeacherCoAttainmentVO> voList = new ArrayList<>();

        for (CourseObjective co : cos) {
            List<AssessmentItem> items = assessmentItemMapper.selectList(
                    new LambdaQueryWrapper<AssessmentItem>().eq(AssessmentItem::getCourseObjectiveId, co.getId())
            );

            BigDecimal numerator = BigDecimal.ZERO;   // Σ(Wm * Savg,m)
            BigDecimal denominator = BigDecimal.ZERO; // Σ(Wm * Smax,m)

            BigDecimal targetMaxSum = BigDecimal.ZERO;
            BigDecimal classAvgSum = BigDecimal.ZERO;

            for (AssessmentItem item : items) {
                AssessmentMethod method = assessmentMethodMapper.selectById(item.getMethodId());
                BigDecimal Wm = (method != null && method.getWeight() != null) ? method.getWeight() : BigDecimal.ONE;

                // 计算该细项全班平均得分 Savg,m
                List<StudentScore> scores = studentScoreMapper.selectList(
                        new LambdaQueryWrapper<StudentScore>()
                                .eq(StudentScore::getTeachingClassId, classId)
                                .eq(StudentScore::getAssessmentItemId, item.getId())
                );

                BigDecimal actualSum = scores.stream()
                        .map(s -> s.getActualScore() != null ? s.getActualScore() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal Savg = (studentCount > 0)
                        ? actualSum.divide(new BigDecimal(studentCount), 4, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;

                BigDecimal Smax = item.getMaxScore() != null ? item.getMaxScore() : BigDecimal.ZERO;

                numerator = numerator.add(Wm.multiply(Savg));
                denominator = denominator.add(Wm.multiply(Smax));

                targetMaxSum = targetMaxSum.add(Smax);
                classAvgSum = classAvgSum.add(Savg);
            }

            BigDecimal attainmentVal = (denominator.compareTo(BigDecimal.ZERO) > 0)
                    ? numerator.divide(denominator, 3, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            // 写入或更新 course_attainment 表
            CourseAttainment ca = courseAttainmentMapper.selectOne(
                    new LambdaQueryWrapper<CourseAttainment>()
                            .eq(CourseAttainment::getTeachingClassId, classId)
                            .eq(CourseAttainment::getCourseObjectiveId, co.getId())
            );
            if (ca == null) {
                ca = new CourseAttainment();
                ca.setTeachingClassId(classId);
                ca.setCourseObjectiveId(co.getId());
            }
            ca.setAttainmentVal(attainmentVal);
            if (ca.getId() == null) {
                courseAttainmentMapper.insert(ca);
            } else {
                courseAttainmentMapper.updateById(ca);
            }

            TeacherCoAttainmentVO vo = new TeacherCoAttainmentVO();
            vo.setCoId(co.getId());
            vo.setCoCode(co.getObjectiveCode());
            vo.setCoDescription(co.getContent());

            // 一个课程目标可能支撑多个毕业要求指标点。
            List<CourseObjIndicatorMap> mapRels = courseObjIndicatorMapMapper.selectList(
                    new LambdaQueryWrapper<CourseObjIndicatorMap>().eq(CourseObjIndicatorMap::getCourseObjectiveId, co.getId())
            );
            if (mapRels.isEmpty()) {
                vo.setIndicatorPointCode("未绑定");
            } else {
                String indicatorCodes = mapRels.stream()
                        .map(rel -> gradIndicatorPointMapper.selectById(rel.getIndicatorPointId()))
                        .filter(Objects::nonNull)
                        .map(GradIndicatorPoint::getCode)
                        .filter(Objects::nonNull)
                        .collect(Collectors.joining(", "));
                vo.setIndicatorPointCode(indicatorCodes.isEmpty() ? "指标点" : indicatorCodes);
            }

            vo.setTargetMaxScore(targetMaxSum.setScale(2, RoundingMode.HALF_UP));
            vo.setClassAvgScore(classAvgSum.setScale(2, RoundingMode.HALF_UP));
            vo.setAttainmentVal(attainmentVal);
            vo.setWarningThreshold(new BigDecimal("0.680"));
            vo.setIsQualified(attainmentVal.compareTo(new BigDecimal("0.680")) >= 0 ? 1 : 0);
            voList.add(vo);
        }

        return voList;
    }

    @Override
    public List<TeacherCoAttainmentVO> listCoAttainment(Long teacherId, Long classId) {
        return calculateCoAttainment(teacherId, classId);
    }

    // -------------------------------------------------------------------------
    // 4.5 班级教学改进反思表
    // -------------------------------------------------------------------------
    @Override
    @Transactional
    public void saveImprovement(Long teacherId, Long classId, SaveImprovementDTO dto) {
        TeachingClass tc = teachingClassMapper.selectById(classId);
        if (tc == null) {
            throw new BusinessException(50001, "教学班不存在");
        }

        ContinuousImprovement ci = continuousImprovementMapper.selectOne(
                new LambdaQueryWrapper<ContinuousImprovement>().eq(ContinuousImprovement::getTeachingClassId, classId)
        );
        if (ci == null) {
            ci = new ContinuousImprovement();
            ci.setTeachingClassId(classId);
        }
        ci.setProblemAnalysis(dto.getProblemAnalysis());
        ci.setImprovementMeasures(dto.getImprovementMeasures());
        ci.setCreatedBy(teacherId);

        if (ci.getId() == null) {
            continuousImprovementMapper.insert(ci);
        } else {
            continuousImprovementMapper.updateById(ci);
        }
    }

    @Override
    public List<TeachingImprovementVO> listImprovements(Long teacherId, Long classId) {
        TeachingClass tc = teachingClassMapper.selectById(classId);
        if (tc == null) {
            throw new BusinessException(50001, "教学班不存在");
        }

        List<ContinuousImprovement> list = continuousImprovementMapper.selectList(
                new LambdaQueryWrapper<ContinuousImprovement>().eq(ContinuousImprovement::getTeachingClassId, classId)
        );

        return list.stream().map(ci -> {
            TeachingImprovementVO vo = new TeachingImprovementVO();
            vo.setId(ci.getId());
            vo.setClassId(classId);
            vo.setClassName(tc.getClassName());
            vo.setProblemAnalysis(ci.getProblemAnalysis());
            vo.setImprovementMeasures(ci.getImprovementMeasures());
            vo.setCreatedBy(ci.getCreatedBy());

            SysUser teacher = sysUserMapper.selectById(ci.getCreatedBy());
            vo.setCreatorName(teacher != null ? teacher.getRealName() : "授课教师");
            vo.setCreatedAt(ci.getCreatedAt() != null ? ci.getCreatedAt() : LocalDateTime.now());

            // 计算该班低达成度目标
            List<TeacherCoAttainmentVO> attainments = listCoAttainment(teacherId, classId);
            String lowCos = attainments.stream()
                    .filter(a -> a.getIsQualified() == 0)
                    .map(TeacherCoAttainmentVO::getCoCode)
                    .collect(Collectors.joining(", "));
            vo.setLowAttainmentCos(lowCos.isEmpty() ? "全达标 (无低于0.680的目标)" : lowCos);
            return vo;
        }).collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // 4.6 认证样品归档表
    // -------------------------------------------------------------------------
    @Override
    @Transactional
    public void uploadSample(Long teacherId, Long classId, UploadSampleDTO dto) {
        TeachingClass tc = teachingClassMapper.selectById(classId);
        if (tc == null) {
            throw new BusinessException(50001, "教学班不存在");
        }

        EvidenceMaterial em = new EvidenceMaterial();
        em.setTeachingClassId(classId);
        em.setAssessmentMethodId(dto.getMethodId());
        em.setFileName(dto.getFileName());
        em.setFilePath(dto.getFilePath());
        em.setLevelTag(dto.getLevelTag());
        em.setUploadedBy(teacherId);

        evidenceMaterialMapper.insert(em);
    }

    @Override
    public List<EvidenceSampleVO> listSamples(Long teacherId, Long classId) {
        TeachingClass tc = teachingClassMapper.selectById(classId);
        if (tc == null) {
            throw new BusinessException(50001, "教学班不存在");
        }

        List<EvidenceMaterial> list = evidenceMaterialMapper.selectList(
                new LambdaQueryWrapper<EvidenceMaterial>().eq(EvidenceMaterial::getTeachingClassId, classId)
        );

        return list.stream().map(em -> {
            EvidenceSampleVO vo = new EvidenceSampleVO();
            vo.setId(em.getId());
            vo.setClassId(classId);
            vo.setClassName(tc.getClassName());
            vo.setMethodId(em.getAssessmentMethodId());

            AssessmentMethod method = assessmentMethodMapper.selectById(em.getAssessmentMethodId());
            vo.setMethodName(method != null ? method.getName() : "考核模块");

            vo.setLevelTag(em.getLevelTag());
            if ("HIGH".equalsIgnoreCase(em.getLevelTag())) {
                vo.setLevelTagDesc("高 - 优秀");
            } else if ("MEDIUM".equalsIgnoreCase(em.getLevelTag())) {
                vo.setLevelTagDesc("中 - 中等");
            } else {
                vo.setLevelTagDesc("低 - 不及格");
            }

            vo.setFileName(em.getFileName());
            vo.setFilePath(em.getFilePath());
            vo.setUploadedBy(em.getUploadedBy());

            SysUser uploader = sysUserMapper.selectById(em.getUploadedBy());
            vo.setUploaderName(uploader != null ? uploader.getRealName() : "授课教师");
            vo.setUploadedAt(em.getUploadedAt());
            return vo;
        }).collect(Collectors.toList());
    }
}
