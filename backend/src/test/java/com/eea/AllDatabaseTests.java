package com.eea;

import com.eea.mapper.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
public class AllDatabaseTests {

    @Autowired
    private AssessmentItemMapper assessmentItemMapper;
    @Autowired
    private AssessmentMethodMapper assessmentMethodMapper;
    @Autowired
    private ClassInfoMapper classInfoMapper;
    @Autowired
    private ContinuousImprovementMapper continuousImprovementMapper;
    @Autowired
    private CourseAttainmentMapper courseAttainmentMapper;
    @Autowired
    private CourseMapper courseMapper;
    @Autowired
    private CourseObjIndicatorMapMapper courseObjIndicatorMapMapper;
    @Autowired
    private CourseObjectiveMapper courseObjectiveMapper;
    @Autowired
    private EvidenceMaterialMapper evidenceMaterialMapper;
    @Autowired
    private GradIndicatorPointMapper gradIndicatorPointMapper;
    @Autowired
    private GradRequirementMapper gradRequirementMapper;
    @Autowired
    private ProgramSchemeMapper programSchemeMapper;
    @Autowired
    private StudentInfoMapper studentInfoMapper;
    @Autowired
    private StudentScoreMapper studentScoreMapper;
    @Autowired
    private SurveyAnswerMapper surveyAnswerMapper;
    @Autowired
    private SurveyQuestionnaireMapper surveyQuestionnaireMapper;
    @Autowired
    private SysOrganizationMapper sysOrganizationMapper;
    @Autowired
    private SysRoleMapper sysRoleMapper;
    @Autowired
    private SysUserMapper sysUserMapper;
    @Autowired
    private SysUserRoleMapper sysUserRoleMapper;
    @Autowired
    private TeachingClassMapper teachingClassMapper;
    @Autowired
    private TeachingClassStudentMapper teachingClassStudentMapper;
    
    // 新增自评报告与审计日志的 4 个 Mapper
    @Autowired
    private ReportMapper reportMapper;
    @Autowired
    private ReportSectionMapper reportSectionMapper;
    @Autowired
    private ReportDataSourceMapper reportDataSourceMapper;
    @Autowired
    private SysAuditLogMapper sysAuditLogMapper;

    @Test
    void testAllMappers() {
        System.out.println("\n==================================================");
        System.out.println("====== 开始测试所有 Mapper 和 Entity 数据库连通与映射 ======");
        System.out.println("==================================================");

        // 验证 Mapper 注入不为空
        assertNotNull(assessmentItemMapper, "assessmentItemMapper 注入失败");
        assertNotNull(assessmentMethodMapper, "assessmentMethodMapper 注入失败");
        assertNotNull(classInfoMapper, "classInfoMapper 注入失败");
        assertNotNull(continuousImprovementMapper, "continuousImprovementMapper 注入失败");
        assertNotNull(courseAttainmentMapper, "courseAttainmentMapper 注入失败");
        assertNotNull(courseMapper, "courseMapper 注入失败");
        assertNotNull(courseObjIndicatorMapMapper, "courseObjIndicatorMapMapper 注入失败");
        assertNotNull(courseObjectiveMapper, "courseObjectiveMapper 注入失败");
        assertNotNull(evidenceMaterialMapper, "evidenceMaterialMapper 注入失败");
        assertNotNull(gradIndicatorPointMapper, "gradIndicatorPointMapper 注入失败");
        assertNotNull(gradRequirementMapper, "gradRequirementMapper 注入失败");
        assertNotNull(programSchemeMapper, "programSchemeMapper 注入失败");
        assertNotNull(studentInfoMapper, "studentInfoMapper 注入失败");
        assertNotNull(studentScoreMapper, "studentScoreMapper 注入失败");
        assertNotNull(surveyAnswerMapper, "surveyAnswerMapper 注入失败");
        assertNotNull(surveyQuestionnaireMapper, "surveyQuestionnaireMapper 注入失败");
        assertNotNull(sysOrganizationMapper, "sysOrganizationMapper 注入失败");
        assertNotNull(sysRoleMapper, "sysRoleMapper 注入失败");
        assertNotNull(sysUserMapper, "sysUserMapper 注入失败");
        assertNotNull(sysUserRoleMapper, "sysUserRoleMapper 注入失败");
        assertNotNull(teachingClassMapper, "teachingClassMapper 注入失败");
        assertNotNull(teachingClassStudentMapper, "teachingClassStudentMapper 注入失败");
        
        // 验证新增的 Mapper 注入
        assertNotNull(reportMapper, "reportMapper 注入失败");
        assertNotNull(reportSectionMapper, "reportSectionMapper 注入失败");
        assertNotNull(reportDataSourceMapper, "reportDataSourceMapper 注入失败");
        assertNotNull(sysAuditLogMapper, "sysAuditLogMapper 注入失败");

        // 验证每个 Mapper 的数据库查询
        assertQuerySuccess("sys_organization", () -> sysOrganizationMapper.selectCount(null));
        assertQuerySuccess("sys_role", () -> sysRoleMapper.selectCount(null));
        assertQuerySuccess("sys_user", () -> sysUserMapper.selectCount(null));
        assertQuerySuccess("sys_user_role", () -> sysUserRoleMapper.selectCount(null));
        assertQuerySuccess("class_info", () -> classInfoMapper.selectCount(null));
        assertQuerySuccess("student_info", () -> studentInfoMapper.selectCount(null));
        assertQuerySuccess("program_scheme", () -> programSchemeMapper.selectCount(null));
        assertQuerySuccess("grad_requirement", () -> gradRequirementMapper.selectCount(null));
        assertQuerySuccess("grad_indicator_point", () -> gradIndicatorPointMapper.selectCount(null));
        assertQuerySuccess("course", () -> courseMapper.selectCount(null));
        assertQuerySuccess("course_objective", () -> courseObjectiveMapper.selectCount(null));
        assertQuerySuccess("course_obj_indicator_map", () -> courseObjIndicatorMapMapper.selectCount(null));
        assertQuerySuccess("teaching_class", () -> teachingClassMapper.selectCount(null));
        assertQuerySuccess("teaching_class_student", () -> teachingClassStudentMapper.selectCount(null));
        assertQuerySuccess("assessment_method", () -> assessmentMethodMapper.selectCount(null));
        assertQuerySuccess("assessment_item", () -> assessmentItemMapper.selectCount(null));
        assertQuerySuccess("student_score", () -> studentScoreMapper.selectCount(null));
        assertQuerySuccess("evidence_material", () -> evidenceMaterialMapper.selectCount(null));
        assertQuerySuccess("course_attainment", () -> courseAttainmentMapper.selectCount(null));
        assertQuerySuccess("continuous_improvement", () -> continuousImprovementMapper.selectCount(null));
        assertQuerySuccess("survey_questionnaire", () -> surveyQuestionnaireMapper.selectCount(null));
        assertQuerySuccess("survey_answer", () -> surveyAnswerMapper.selectCount(null));
        
        // 验证新增 4 个表的数据库映射与查询
        assertQuerySuccess("report", () -> reportMapper.selectCount(null));
        assertQuerySuccess("report_section", () -> reportSectionMapper.selectCount(null));
        assertQuerySuccess("report_data_source", () -> reportDataSourceMapper.selectCount(null));
        assertQuerySuccess("sys_audit_log", () -> sysAuditLogMapper.selectCount(null));

        System.out.println("==================================================");
        System.out.println("====== 所有 Mapper 和 Entity 映射关系校验通过！ ======");
        System.out.println("==================================================");
    }

    private void assertQuerySuccess(String tableName, Supplier<Long> countSupplier) {
        try {
            Long count = countSupplier.get();
            System.out.println("-> 表 [" + tableName + "] 映射测试成功，当前库中记录数：" + count);
        } catch (Exception e) {
            System.err.println("-> 表 [" + tableName + "] 映射校验失败！请检查表结构与 Entity 属性对应关系。");
            throw e;
        }
    }
}
