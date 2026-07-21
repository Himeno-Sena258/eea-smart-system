package com.eea.service.student.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.entity.*;
import com.eea.mapper.*;
import com.eea.service.student.StudentAttainmentService;
import com.eea.vo.StudentAttainmentVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class StudentAttainmentServiceImpl implements StudentAttainmentService {

    @Autowired
    private GradIndicatorPointMapper indicatorPointMapper;
    @Autowired
    private GradRequirementMapper gradRequirementMapper;
    @Autowired
    private CourseObjIndicatorMapMapper coiMapper;
    @Autowired
    private CourseObjectiveMapper objectiveMapper;
    @Autowired
    private AssessmentItemMapper itemMapper;
    @Autowired
    private StudentScoreMapper studentScoreMapper;

    private static final BigDecimal THRESHOLD = new BigDecimal("0.680");

    @Override
    public List<StudentAttainmentVO> listAttainment(Long studentId) {
        // 1. 取该学生的所有得分
        QueryWrapper<StudentScore> scoreW = new QueryWrapper<>();
        scoreW.eq("student_id", studentId);
        List<StudentScore> scores = studentScoreMapper.selectList(scoreW);
        if (scores.isEmpty()) {
            return buildEmpty(THRESHOLD);
        }

        // 2. 拿到所有考核细项
        Set<Long> itemIds = new HashSet<>();
        for (StudentScore s : scores) itemIds.add(s.getAssessmentItemId());
        List<AssessmentItem> items = itemMapper.selectBatchIds(new ArrayList<>(itemIds));
        Map<Long, AssessmentItem> itemMap = new HashMap<>();
        for (AssessmentItem i : items) itemMap.put(i.getId(), i);

        // 3. 逐项计算：item → course_objective → indicator_point
        //    key: indicatorPointId, value: { totalActual, totalMax }
        Map<Long, BigDecimal[]> indicatorScores = new HashMap<>();
        Map<Long, Long> indicatorObjectiveMap = new HashMap<>(); // indicatorPointId → courseObjectiveId

        for (StudentScore s : scores) {
            AssessmentItem item = itemMap.get(s.getAssessmentItemId());
            if (item == null) continue;

            Long objId = item.getCourseObjectiveId();
            if (objId == null) continue;

            // 查 objective → indicator points
            QueryWrapper<CourseObjIndicatorMap> coiW = new QueryWrapper<>();
            coiW.eq("course_objective_id", objId);
            List<CourseObjIndicatorMap> maps = coiMapper.selectList(coiW);
            if (maps.isEmpty()) continue;

            BigDecimal actual = s.getActualScore();
            BigDecimal max = item.getMaxScore();
            if (max == null || max.compareTo(BigDecimal.ZERO) == 0) continue;

            for (CourseObjIndicatorMap map : maps) {
                Long ipId = map.getIndicatorPointId();
                BigDecimal[] totals = indicatorScores.getOrDefault(ipId, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
                totals[0] = totals[0].add(actual);
                totals[1] = totals[1].add(max);
                indicatorScores.put(ipId, totals);
                indicatorObjectiveMap.put(ipId, objId);
            }
        }

        // 4. 只返回该学生成绩实际支撑到的指标点，避免其他方案/无成绩指标被前端展示为 0。
        if (indicatorScores.isEmpty()) {
            return Collections.emptyList();
        }
        List<GradIndicatorPoint> allPoints = indicatorPointMapper.selectBatchIds(new ArrayList<>(indicatorScores.keySet()));
        allPoints.sort(Comparator.comparing(GradIndicatorPoint::getCode));
        Map<Long, GradRequirement> reqMap = new HashMap<>();
        for (GradIndicatorPoint ip : allPoints) {
            if (!reqMap.containsKey(ip.getReqId())) {
                GradRequirement req = gradRequirementMapper.selectById(ip.getReqId());
                if (req != null) reqMap.put(ip.getReqId(), req);
            }
        }

        List<StudentAttainmentVO> result = new ArrayList<>();
        for (GradIndicatorPoint ip : allPoints) {
            BigDecimal[] totals = indicatorScores.get(ip.getId());
            BigDecimal attainmentVal = null;
            boolean passed = false;

            if (totals != null && totals[1].compareTo(BigDecimal.ZERO) > 0) {
                attainmentVal = totals[0].divide(totals[1], 3, RoundingMode.HALF_UP);
                passed = attainmentVal.compareTo(THRESHOLD) >= 0;
            }

            GradRequirement req = reqMap.get(ip.getReqId());
            result.add(new StudentAttainmentVO(
                    ip.getCode(), ip.getContent(), THRESHOLD,
                    attainmentVal, passed,
                    req != null ? req.getTitle() : ""
            ));
        }
        return result;
    }

    private List<StudentAttainmentVO> buildEmpty(BigDecimal threshold) {
        return Collections.emptyList();
    }
}
