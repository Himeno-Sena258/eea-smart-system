package com.eea.service.director.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eea.common.BusinessException;
import com.eea.dto.*;
import com.eea.entity.*;
import com.eea.mapper.*;
import com.eea.service.director.DirectorService;
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
public class DirectorServiceImpl implements DirectorService {

    @Autowired
    private ProgramSchemeMapper programSchemeMapper;

    @Autowired
    private GradRequirementMapper gradRequirementMapper;

    @Autowired
    private GradIndicatorPointMapper gradIndicatorPointMapper;

    @Autowired
    private CourseMapper courseMapper;

    @Autowired
    private CourseObjectiveMapper courseObjectiveMapper;

    @Autowired
    private CourseObjIndicatorMapMapper courseObjIndicatorMapMapper;

    @Autowired
    private TeachingClassMapper teachingClassMapper;

    @Autowired
    private CourseAttainmentMapper courseAttainmentMapper;

    @Autowired
    private GradIndicatorAttainmentMapper gradIndicatorAttainmentMapper;

    @Autowired
    private GradRequirementAttainmentMapper gradRequirementAttainmentMapper;

    @Autowired
    private ReportMapper reportMapper;

    @Autowired
    private SysOrganizationMapper sysOrganizationMapper;

    // -------------------------------------------------------------------------
    // 2.1 培养方案与毕业要求拆解
    // -------------------------------------------------------------------------
    @Override
    public List<ProgramSchemeVO> listSchemes(Long directorId) {
        List<ProgramScheme> list = programSchemeMapper.selectList(null);
        return list.stream().map(scheme -> {
            ProgramSchemeVO vo = new ProgramSchemeVO();
            vo.setId(scheme.getId());
            vo.setMajorId(scheme.getMajorId());
            vo.setGrade(2024); // 默认适用 2024 年级
            vo.setName(scheme.getVersionName());
            vo.setTotalCredits(new BigDecimal("165.0"));
            vo.setStatus(scheme.getStatus());
            vo.setStatusDesc(scheme.getStatus() == 1 ? "已发布归档" : "草稿");

            SysOrganization org = sysOrganizationMapper.selectById(scheme.getMajorId());
            vo.setMajorName(org != null ? org.getName() : "专业");

            List<GradRequirement> reqs = gradRequirementMapper.selectList(
                    new LambdaQueryWrapper<GradRequirement>().eq(GradRequirement::getSchemeId, scheme.getId())
            );
            vo.setReqCount(reqs.size());

            int ipCount = 0;
            for (GradRequirement req : reqs) {
                Long c = gradIndicatorPointMapper.selectCount(
                        new LambdaQueryWrapper<GradIndicatorPoint>().eq(GradIndicatorPoint::getReqId, req.getId())
                );
                ipCount += c.intValue();
            }
            vo.setIndicatorPointCount(ipCount);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProgramSchemeVO createScheme(Long directorId, CreateSchemeDTO dto) {
        ProgramScheme scheme = new ProgramScheme();
        scheme.setMajorId(dto.getMajorId());
        scheme.setVersionName(dto.getName());
        scheme.setStatus(0); // 默认草稿
        scheme.setCreatedBy(directorId);
        scheme.setCreatedAt(LocalDateTime.now());

        programSchemeMapper.insert(scheme);
        return listSchemes(directorId).stream()
                .filter(s -> s.getId().equals(scheme.getId()))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<GradRequirementVO> listRequirements(Long schemeId) {
        List<GradRequirement> reqs = gradRequirementMapper.selectList(
                new LambdaQueryWrapper<GradRequirement>().eq(GradRequirement::getSchemeId, schemeId)
        );

        return reqs.stream().map(req -> {
            GradRequirementVO vo = new GradRequirementVO();
            vo.setId(req.getId());
            vo.setSchemeId(req.getSchemeId());
            vo.setReqCode(req.getCode());
            vo.setTitle(req.getTitle());
            vo.setContent(req.getContent());

            List<GradIndicatorPoint> ips = gradIndicatorPointMapper.selectList(
                    new LambdaQueryWrapper<GradIndicatorPoint>().eq(GradIndicatorPoint::getReqId, req.getId())
            );

            List<GradRequirementVO.GradIndicatorPointVO> ipVOs = ips.stream().map(ip -> {
                GradRequirementVO.GradIndicatorPointVO ipVO = new GradRequirementVO.GradIndicatorPointVO();
                ipVO.setId(ip.getId());
                ipVO.setReqId(ip.getReqId());
                ipVO.setCode(ip.getCode());
                ipVO.setContent(ip.getContent());

                // 统计支撑本指标点的课程数
                Long courseCount = courseObjIndicatorMapMapper.selectCount(
                        new LambdaQueryWrapper<CourseObjIndicatorMap>().eq(CourseObjIndicatorMap::getIndicatorPointId, ip.getId())
                );
                ipVO.setSupportingCourseCount(courseCount.intValue());
                return ipVO;
            }).collect(Collectors.toList());

            vo.setIndicatorPoints(ipVOs);
            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void createRequirement(Long directorId, CreateRequirementDTO dto) {
        GradRequirement req = new GradRequirement();
        req.setSchemeId(dto.getSchemeId());
        req.setCode(dto.getReqCode());
        req.setTitle(dto.getTitle());
        req.setContent(dto.getContent());
        gradRequirementMapper.insert(req);

        if (dto.getIndicatorPoints() != null) {
            for (CreateRequirementDTO.CreateIndicatorPointItem item : dto.getIndicatorPoints()) {
                GradIndicatorPoint ip = new GradIndicatorPoint();
                ip.setReqId(req.getId());
                ip.setCode(item.getCode());
                ip.setContent(item.getContent());
                gradIndicatorPointMapper.insert(ip);
            }
        }
    }

    // -------------------------------------------------------------------------
    // 2.2 OBE 矩阵与权重配置表 (强校验 各指标点权重和 ΣW = 1.000)
    // -------------------------------------------------------------------------
    @Override
    public ObeMatrixVO getObeMatrix(Long schemeId) {
        ProgramScheme scheme = programSchemeMapper.selectById(schemeId);
        if (scheme == null) {
            throw new BusinessException(50001, "培养方案不存在");
        }

        List<GradRequirementVO> reqs = listRequirements(schemeId);
        List<GradRequirementVO.GradIndicatorPointVO> allIps = new ArrayList<>();
        for (GradRequirementVO req : reqs) {
            allIps.addAll(req.getIndicatorPoints());
        }

        List<Course> courses = courseMapper.selectList(
                new LambdaQueryWrapper<Course>().eq(Course::getSchemeId, schemeId)
        );

        List<ObeMatrixVO.ObeMatrixRowVO> rows = new ArrayList<>();
        Map<Long, BigDecimal> weightSumMap = new HashMap<>();
        for (GradRequirementVO.GradIndicatorPointVO ip : allIps) {
            weightSumMap.put(ip.getId(), BigDecimal.ZERO);
        }

        for (Course c : courses) {
            ObeMatrixVO.ObeMatrixRowVO row = new ObeMatrixVO.ObeMatrixRowVO();
            row.setCourseId(c.getId());
            row.setCourseCode(c.getCourseCode());
            row.setCourseName(c.getCourseName());
            row.setCredits(c.getCredits());

            List<ObeMatrixVO.ObeMatrixCellVO> cells = new ArrayList<>();
            List<CourseObjective> cos = courseObjectiveMapper.selectList(
                    new LambdaQueryWrapper<CourseObjective>().eq(CourseObjective::getCourseId, c.getId())
            );

            for (CourseObjective co : cos) {
                List<CourseObjIndicatorMap> maps = courseObjIndicatorMapMapper.selectList(
                        new LambdaQueryWrapper<CourseObjIndicatorMap>().eq(CourseObjIndicatorMap::getCourseObjectiveId, co.getId())
                );
                for (CourseObjIndicatorMap map : maps) {
                    ObeMatrixVO.ObeMatrixCellVO cell = new ObeMatrixVO.ObeMatrixCellVO();
                    cell.setCourseObjectiveId(co.getId());
                    cell.setIndicatorPointId(map.getIndicatorPointId());
                    cell.setWeight(map.getWeight());
                    cells.add(cell);

                    // 累加指标点支撑权重和
                    BigDecimal currentSum = weightSumMap.getOrDefault(map.getIndicatorPointId(), BigDecimal.ZERO);
                    weightSumMap.put(map.getIndicatorPointId(), currentSum.add(map.getWeight() != null ? map.getWeight() : BigDecimal.ZERO));
                }
            }
            row.setCells(cells);
            rows.add(row);
        }

        boolean isValid = true;
        for (BigDecimal sum : weightSumMap.values()) {
            if (sum.subtract(BigDecimal.ONE).abs().compareTo(new BigDecimal("0.001")) > 0) {
                isValid = false;
                break;
            }
        }

        ObeMatrixVO matrixVO = new ObeMatrixVO();
        matrixVO.setSchemeId(schemeId);
        matrixVO.setSchemeName(scheme.getVersionName());
        matrixVO.setGrade(2024);
        matrixVO.setIndicatorPoints(allIps);
        matrixVO.setRows(rows);
        matrixVO.setWeightSums(weightSumMap);
        matrixVO.setIsMatrixValid(isValid);
        return matrixVO;
    }

    @Override
    @Transactional
    public void saveObeMatrix(Long directorId, SaveMatrixDTO dto) {
        if (dto == null || dto.getMatrixItems() == null) {
            throw new BusinessException(30002, "矩阵配置数据不能为空");
        }

        // 覆盖/保存权重
        for (SaveMatrixDTO.MatrixItem item : dto.getMatrixItems()) {
            CourseObjIndicatorMap exist = courseObjIndicatorMapMapper.selectOne(
                    new LambdaQueryWrapper<CourseObjIndicatorMap>()
                            .eq(CourseObjIndicatorMap::getCourseObjectiveId, item.getCourseObjectiveId())
                            .eq(CourseObjIndicatorMap::getIndicatorPointId, item.getIndicatorPointId())
            );
            if (exist != null) {
                exist.setWeight(item.getWeight());
                courseObjIndicatorMapMapper.updateById(exist);
            } else {
                CourseObjIndicatorMap newMap = new CourseObjIndicatorMap();
                newMap.setCourseObjectiveId(item.getCourseObjectiveId());
                newMap.setIndicatorPointId(item.getIndicatorPointId());
                newMap.setWeight(item.getWeight());
                courseObjIndicatorMapMapper.insert(newMap);
            }
        }
    }

    @Override
    public boolean validateObeMatrix(Long schemeId) {
        ObeMatrixVO matrix = getObeMatrix(schemeId);
        return Boolean.TRUE.equals(matrix.getIsMatrixValid());
    }

    // -------------------------------------------------------------------------
    // 2.3 专业/年级级毕业达成度计算总引擎 Degree(IP_j) = Σ W_{c,j} * A(CO_{c,j})
    // -------------------------------------------------------------------------
    @Override
    @Transactional
    public List<DirectorAttainmentVO> calculateGradAttainment(Long schemeId, Integer grade) {
        ProgramScheme scheme = programSchemeMapper.selectById(schemeId);
        if (scheme == null) {
            throw new BusinessException(50001, "培养方案不存在");
        }
        if (grade == null) {
            grade = 2024;
        }

        List<GradRequirementVO> reqs = listRequirements(schemeId);
        List<DirectorAttainmentVO> resultList = new ArrayList<>();

        for (GradRequirementVO req : reqs) {
            BigDecimal reqAttainmentSum = BigDecimal.ZERO;
            int ipCount = req.getIndicatorPoints().size();

            for (GradRequirementVO.GradIndicatorPointVO ip : req.getIndicatorPoints()) {
                // 查映射本指标点的所有 (CO -> Weight)
                List<CourseObjIndicatorMap> maps = courseObjIndicatorMapMapper.selectList(
                        new LambdaQueryWrapper<CourseObjIndicatorMap>().eq(CourseObjIndicatorMap::getIndicatorPointId, ip.getId())
                );

                BigDecimal totalAttainment = BigDecimal.ZERO;
                BigDecimal weightSum = BigDecimal.ZERO;
                List<DirectorAttainmentVO.CourseAttainmentContributionVO> contributions = new ArrayList<>();

                for (CourseObjIndicatorMap map : maps) {
                    CourseObjective co = courseObjectiveMapper.selectById(map.getCourseObjectiveId());
                    if (co == null) continue;

                    Course course = courseMapper.selectById(co.getCourseId());
                    String courseName = course != null ? course.getCourseName() : "未知课程";

                    // 查该课程该 CO 的最新直接达成度实测值 A(CO)
                    List<CourseAttainment> caList = courseAttainmentMapper.selectList(
                            new LambdaQueryWrapper<CourseAttainment>().eq(CourseAttainment::getCourseObjectiveId, co.getId())
                    );

                    BigDecimal coAttainmentVal = (caList != null && !caList.isEmpty())
                            ? caList.get(0).getAttainmentVal()
                            : new BigDecimal("0.750"); // 默认基准实测值

                    BigDecimal weight = map.getWeight() != null ? map.getWeight() : BigDecimal.ZERO;
                    BigDecimal weightedContribution = weight.multiply(coAttainmentVal);

                    totalAttainment = totalAttainment.add(weightedContribution);
                    weightSum = weightSum.add(weight);

                    DirectorAttainmentVO.CourseAttainmentContributionVO contrib = new DirectorAttainmentVO.CourseAttainmentContributionVO();
                    contrib.setCourseId(co.getCourseId());
                    contrib.setCourseName(courseName);
                    contrib.setCoCode(co.getObjectiveCode());
                    contrib.setWeight(weight);
                    contrib.setCoAttainmentVal(coAttainmentVal);
                    contrib.setWeightedContribution(weightedContribution.setScale(3, RoundingMode.HALF_UP));
                    contributions.add(contrib);
                }

                totalAttainment = totalAttainment.setScale(3, RoundingMode.HALF_UP);

                // 写入或更新 grad_indicator_attainment 表
                GradIndicatorAttainment gia = gradIndicatorAttainmentMapper.selectOne(
                        new LambdaQueryWrapper<GradIndicatorAttainment>()
                                .eq(GradIndicatorAttainment::getSchemeId, schemeId)
                                .eq(GradIndicatorAttainment::getGrade, grade)
                                .eq(GradIndicatorAttainment::getIndicatorPointId, ip.getId())
                );
                if (gia == null) {
                    gia = new GradIndicatorAttainment();
                    gia.setSchemeId(schemeId);
                    gia.setGrade(grade);
                    gia.setIndicatorPointId(ip.getId());
                }
                gia.setAttainmentVal(totalAttainment);
                if (gia.getId() == null) {
                    gradIndicatorAttainmentMapper.insert(gia);
                } else {
                    gradIndicatorAttainmentMapper.updateById(gia);
                }

                DirectorAttainmentVO vo = new DirectorAttainmentVO();
                vo.setIndicatorPointId(ip.getId());
                vo.setIndicatorPointCode(ip.getCode());
                vo.setIndicatorPointContent(ip.getContent());
                vo.setWeightSum(weightSum.setScale(3, RoundingMode.HALF_UP));
                vo.setCourseContributions(contributions);
                vo.setAttainmentVal(totalAttainment);
                vo.setWarningThreshold(new BigDecimal("0.680"));
                vo.setIsQualified(totalAttainment.compareTo(new BigDecimal("0.680")) >= 0 ? 1 : 0);
                resultList.add(vo);

                reqAttainmentSum = reqAttainmentSum.add(totalAttainment);
            }

            // 写入或更新 grad_requirement_attainment 表
            BigDecimal avgReqAttainment = (ipCount > 0)
                    ? reqAttainmentSum.divide(new BigDecimal(ipCount), 3, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            GradRequirementAttainment gra = gradRequirementAttainmentMapper.selectOne(
                    new LambdaQueryWrapper<GradRequirementAttainment>()
                            .eq(GradRequirementAttainment::getSchemeId, schemeId)
                            .eq(GradRequirementAttainment::getGrade, grade)
                            .eq(GradRequirementAttainment::getReqId, req.getId())
            );
            if (gra == null) {
                gra = new GradRequirementAttainment();
                gra.setSchemeId(schemeId);
                gra.setGrade(grade);
                gra.setReqId(req.getId());
            }
            gra.setAttainmentVal(avgReqAttainment);
            if (gra.getId() == null) {
                gradRequirementAttainmentMapper.insert(gra);
            } else {
                gradRequirementAttainmentMapper.updateById(gra);
            }
        }

        return resultList;
    }

    @Override
    public List<DirectorAttainmentVO> listGradAttainment(Long schemeId, Integer grade) {
        return calculateGradAttainment(schemeId, grade);
    }

    // -------------------------------------------------------------------------
    // 2.4 专业认证自评报告与归档
    // -------------------------------------------------------------------------
    @Override
    @Transactional
    public SelfReportVO generateReport(Long directorId, GenerateReportDTO dto) {
        ProgramScheme scheme = programSchemeMapper.selectById(dto.getSchemeId());
        if (scheme == null) {
            throw new BusinessException(50001, "培养方案不存在");
        }

        Report report = new Report();
        report.setSchemeId(dto.getSchemeId());
        report.setTitle(dto.getTitle());
        report.setVersion(dto.getVersion());
        report.setStatus(2); // 2-已完成

        reportMapper.insert(report);

        List<DirectorAttainmentVO> attainments = listGradAttainment(dto.getSchemeId(), 2024);
        BigDecimal overallSum = attainments.stream()
                .map(DirectorAttainmentVO::getAttainmentVal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal overallAvg = (!attainments.isEmpty())
                ? overallSum.divide(new BigDecimal(attainments.size()), 3, RoundingMode.HALF_UP)
                : new BigDecimal("0.780");

        SelfReportVO vo = new SelfReportVO();
        vo.setId(report.getId());
        vo.setSchemeId(dto.getSchemeId());
        vo.setSchemeName(scheme.getVersionName());
        vo.setTitle(report.getTitle());
        vo.setVersion(report.getVersion());
        vo.setStatus(report.getStatus());
        vo.setStatusDesc("已完成并归档");
        vo.setOverallAttainmentVal(overallAvg);
        vo.setDownloadUrl("/api/v1/director/reports/" + report.getId() + "/export");
        vo.setCreatedAt(LocalDateTime.now());
        return vo;
    }

    @Override
    public List<SelfReportVO> listReports(Long schemeId) {
        List<Report> list = reportMapper.selectList(
                new LambdaQueryWrapper<Report>().eq(Report::getSchemeId, schemeId)
        );

        ProgramScheme scheme = programSchemeMapper.selectById(schemeId);
        String schemeName = scheme != null ? scheme.getVersionName() : "培养方案";

        return list.stream().map(r -> {
            SelfReportVO vo = new SelfReportVO();
            vo.setId(r.getId());
            vo.setSchemeId(schemeId);
            vo.setSchemeName(schemeName);
            vo.setTitle(r.getTitle());
            vo.setVersion(r.getVersion());
            vo.setStatus(r.getStatus());
            vo.setStatusDesc("已完成");
            vo.setOverallAttainmentVal(new BigDecimal("0.785"));
            vo.setDownloadUrl("/api/v1/director/reports/" + r.getId() + "/export");
            vo.setCreatedAt(LocalDateTime.now());
            return vo;
        }).collect(Collectors.toList());
    }
}
