package com.eea.service.coordinator.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eea.common.BusinessException;
import com.eea.dto.*;
import com.eea.entity.*;
import com.eea.mapper.*;
import com.eea.service.coordinator.CoordinatorService;
import com.eea.vo.*;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CoordinatorServiceImpl implements CoordinatorService {

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private ProgramSchemeMapper programSchemeMapper;

    @Autowired
    private CourseObjectiveMapper courseObjectiveMapper;

    @Autowired
    private CourseObjIndicatorMapMapper courseObjIndicatorMapMapper;

    @Autowired
    private GradIndicatorPointMapper gradIndicatorPointMapper;

    @Autowired
    private AssessmentMethodMapper assessmentMethodMapper;

    @Autowired
    private AssessmentItemMapper assessmentItemMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    // -------------------------------------------------------------------------
    // 3.1 课程教学大纲表
    // -------------------------------------------------------------------------
    @Override
    public List<CoordinatorSyllabusVO> listSyllabus(Long coordinatorId) {
        List<Course> courses = courseMapper.selectList(null);
        return courses.stream().map(c -> buildSyllabusVO(c, coordinatorId)).collect(Collectors.toList());
    }

    @Override
    public CoordinatorSyllabusVO getSyllabusDetail(Long courseId) {
        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new BusinessException(50001, "课程不存在");
        }
        return buildSyllabusVO(course, null);
    }

    @Override
    @Transactional
    public CoordinatorSyllabusVO saveSyllabus(Long coordinatorId, SaveSyllabusDTO dto) {
        Course course = courseMapper.selectById(dto.getCourseId());
        if (course == null) {
            throw new BusinessException(50001, "课程不存在");
        }

        course.setCourseCode(dto.getCourseCode());
        course.setCourseName(dto.getCourseName());
        course.setCredits(dto.getCredits());
        course.setHours(dto.getHours());

        courseMapper.updateById(course);
        return buildSyllabusVO(course, coordinatorId);
    }

    private CoordinatorSyllabusVO buildSyllabusVO(Course c, Long coordinatorId) {
        ProgramScheme scheme = c.getSchemeId() != null ? programSchemeMapper.selectById(c.getSchemeId()) : null;
        SysUser user = coordinatorId != null ? sysUserMapper.selectById(coordinatorId) : null;

        CoordinatorSyllabusVO vo = new CoordinatorSyllabusVO();
        vo.setCourseId(c.getId());
        vo.setCourseCode(c.getCourseCode());
        vo.setCourseName(c.getCourseName());
        vo.setCredits(c.getCredits());
        vo.setHours(c.getHours());
        vo.setSchemeId(c.getSchemeId());
        vo.setSchemeName(scheme != null ? scheme.getVersionName() : "培养方案");
        vo.setCoordinatorId(coordinatorId != null ? coordinatorId : 102L);
        vo.setCoordinatorName(user != null ? user.getRealName() : "李副教授");
        vo.setSyllabusVersion("2024版V1.0");
        vo.setAuditStatus(2); // 2-已审核通过
        vo.setAuditStatusDesc("已审核通过");
        return vo;
    }

    // -------------------------------------------------------------------------
    // 3.2 课程目标 (CO1~CO5) 制定表
    // -------------------------------------------------------------------------
    @Override
    public List<CourseObjectiveVO> listObjectives(Long courseId) {
        List<CourseObjective> cos = courseObjectiveMapper.selectList(
                new LambdaQueryWrapper<CourseObjective>().eq(CourseObjective::getCourseId, courseId)
        );

        return cos.stream().map(co -> {
            CourseObjectiveVO vo = new CourseObjectiveVO();
            vo.setId(co.getId());
            vo.setCourseId(co.getCourseId());
            vo.setObjectiveCode(co.getObjectiveCode());
            vo.setContent(co.getContent());

            // 查支撑的指标点
            List<CourseObjIndicatorMap> maps = courseObjIndicatorMapMapper.selectList(
                    new LambdaQueryWrapper<CourseObjIndicatorMap>().eq(CourseObjIndicatorMap::getCourseObjectiveId, co.getId())
            );

            List<Long> ipIds = new ArrayList<>();
            List<String> ipCodes = new ArrayList<>();
            for (CourseObjIndicatorMap map : maps) {
                GradIndicatorPoint ip = gradIndicatorPointMapper.selectById(map.getIndicatorPointId());
                if (ip != null) {
                    ipIds.add(ip.getId());
                    ipCodes.add(ip.getCode());
                }
            }

            vo.setIndicatorPointIds(ipIds);
            vo.setIndicatorPointCodes(ipCodes);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CourseObjectiveVO saveObjective(Long coordinatorId, SaveObjectiveDTO dto) {
        CourseObjective co;
        if (dto.getId() != null) {
            co = courseObjectiveMapper.selectById(dto.getId());
            if (co == null) throw new BusinessException(50001, "课程目标不存在");
            co.setObjectiveCode(dto.getObjectiveCode());
            co.setContent(dto.getContent());
            courseObjectiveMapper.updateById(co);
        } else {
            co = new CourseObjective();
            co.setCourseId(dto.getCourseId());
            co.setObjectiveCode(dto.getObjectiveCode());
            co.setContent(dto.getContent());
            courseObjectiveMapper.insert(co);
        }

        // 更新支撑指标点
        if (dto.getIndicatorPointIds() != null) {
            courseObjIndicatorMapMapper.delete(
                    new LambdaQueryWrapper<CourseObjIndicatorMap>().eq(CourseObjIndicatorMap::getCourseObjectiveId, co.getId())
            );
            for (Long ipId : dto.getIndicatorPointIds()) {
                CourseObjIndicatorMap map = new CourseObjIndicatorMap();
                map.setCourseObjectiveId(co.getId());
                map.setIndicatorPointId(ipId);
                map.setWeight(new BigDecimal("0.250")); // 默认配置初始权重
                courseObjIndicatorMapMapper.insert(map);
            }
        }

        return listObjectives(dto.getCourseId()).stream()
                .filter(o -> o.getId().equals(co.getId()))
                .findFirst()
                .orElse(null);
    }

    @Override
    @Transactional
    public void deleteObjective(Long objectiveId) {
        courseObjectiveMapper.deleteById(objectiveId);
        courseObjIndicatorMapMapper.delete(
                new LambdaQueryWrapper<CourseObjIndicatorMap>().eq(CourseObjIndicatorMap::getCourseObjectiveId, objectiveId)
        );
    }

    // -------------------------------------------------------------------------
    // 3.3 考核环节权重设置表 (含 ΣW = 1.000 强校验)
    // -------------------------------------------------------------------------
    @Override
    public List<AssessmentMethodVO> listMethods(Long courseId) {
        List<AssessmentMethod> methods = assessmentMethodMapper.selectList(
                new LambdaQueryWrapper<AssessmentMethod>().eq(AssessmentMethod::getCourseId, courseId)
        );

        return methods.stream().map(m -> {
            AssessmentMethodVO vo = new AssessmentMethodVO();
            vo.setId(m.getId());
            vo.setCourseId(m.getCourseId());
            vo.setName(m.getName());
            vo.setWeight(m.getWeight());
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void saveMethods(Long coordinatorId, SaveMethodsDTO dto) {
        if (dto == null || dto.getMethods() == null || dto.getMethods().isEmpty()) {
            throw new BusinessException(30002, "考核环节参数不能为空");
        }

        // 强校验：权重和必须全等于 1.000
        BigDecimal sumWeight = BigDecimal.ZERO;
        for (SaveMethodsDTO.MethodItem item : dto.getMethods()) {
            if (item.getWeight() != null) {
                sumWeight = sumWeight.add(item.getWeight());
            }
        }

        if (sumWeight.subtract(BigDecimal.ONE).abs().compareTo(new BigDecimal("0.001")) > 0) {
            throw new BusinessException(30002, "考核占比权重和非法：所有考核环节权重和为 " + sumWeight + "，必须强等于 1.000！");
        }

        // 覆盖写入
        for (SaveMethodsDTO.MethodItem item : dto.getMethods()) {
            if (item.getId() != null) {
                AssessmentMethod exist = assessmentMethodMapper.selectById(item.getId());
                if (exist != null) {
                    exist.setName(item.getName());
                    exist.setWeight(item.getWeight());
                    assessmentMethodMapper.updateById(exist);
                }
            } else {
                AssessmentMethod method = new AssessmentMethod();
                method.setCourseId(dto.getCourseId());
                method.setName(item.getName());
                method.setWeight(item.getWeight());
                assessmentMethodMapper.insert(method);
            }
        }
    }

    // -------------------------------------------------------------------------
    // 3.4 考核细项与 CO 绑定映射表 (OBE 核心绑定)
    // -------------------------------------------------------------------------
    @Override
    public List<AssessmentItemVO> listItems(Long courseId) {
        List<AssessmentMethod> methods = assessmentMethodMapper.selectList(
                new LambdaQueryWrapper<AssessmentMethod>().eq(AssessmentMethod::getCourseId, courseId)
        );

        if (methods.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> methodIds = methods.stream().map(AssessmentMethod::getId).collect(Collectors.toList());
        List<AssessmentItem> items = assessmentItemMapper.selectList(
                new LambdaQueryWrapper<AssessmentItem>().in(AssessmentItem::getMethodId, methodIds)
        );

        Map<Long, String> methodNameMap = methods.stream().collect(Collectors.toMap(AssessmentMethod::getId, AssessmentMethod::getName));

        return items.stream().map(item -> {
            AssessmentItemVO vo = new AssessmentItemVO();
            vo.setId(item.getId());
            vo.setMethodId(item.getMethodId());
            vo.setMethodName(methodNameMap.getOrDefault(item.getMethodId(), "未知方式"));
            vo.setName(item.getName());
            vo.setMaxScore(item.getMaxScore());
            vo.setCourseObjectiveId(item.getCourseObjectiveId());

            if (item.getCourseObjectiveId() != null) {
                CourseObjective co = courseObjectiveMapper.selectById(item.getCourseObjectiveId());
                vo.setCoCode(co != null ? co.getObjectiveCode() : "CO");
            } else {
                vo.setCoCode("未绑定");
            }

            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AssessmentItemVO saveItem(Long coordinatorId, SaveItemDTO dto) {
        AssessmentItem item;
        if (dto.getId() != null) {
            item = assessmentItemMapper.selectById(dto.getId());
            if (item == null) throw new BusinessException(50001, "考核细项不存在");
            item.setMethodId(dto.getMethodId());
            item.setName(dto.getName());
            item.setMaxScore(dto.getMaxScore());
            item.setCourseObjectiveId(dto.getCourseObjectiveId());
            assessmentItemMapper.updateById(item);
        } else {
            item = new AssessmentItem();
            item.setMethodId(dto.getMethodId());
            item.setName(dto.getName());
            item.setMaxScore(dto.getMaxScore());
            item.setCourseObjectiveId(dto.getCourseObjectiveId());
            assessmentItemMapper.insert(item);
        }

        AssessmentMethod m = assessmentMethodMapper.selectById(item.getMethodId());
        CourseObjective co = item.getCourseObjectiveId() != null ? courseObjectiveMapper.selectById(item.getCourseObjectiveId()) : null;

        AssessmentItemVO vo = new AssessmentItemVO();
        vo.setId(item.getId());
        vo.setMethodId(item.getMethodId());
        vo.setMethodName(m != null ? m.getName() : "考核方式");
        vo.setName(item.getName());
        vo.setMaxScore(item.getMaxScore());
        vo.setCourseObjectiveId(item.getCourseObjectiveId());
        vo.setCoCode(co != null ? co.getObjectiveCode() : "CO");
        return vo;
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId) {
        assessmentItemMapper.deleteById(itemId);
    }
}
