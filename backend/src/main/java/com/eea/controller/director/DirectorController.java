package com.eea.controller.director;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.common.UserContext;
import com.eea.dto.*;
import com.eea.service.director.DirectorService;
import com.eea.vo.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/director")
@Tag(name = "4.1 专业负责人模块", description = "培养方案制定、毕业要求及指标点拆解、OBE矩阵与支撑权重强校验(ΣW=1.000)、专业毕业达成度计算总引擎与自评报告导出")
@RequireRoles("DIRECTOR")
public class DirectorController {

    @Autowired
    private DirectorService directorService;

    // ==================== 2.1 方案与毕业要求 ====================
    @GetMapping("/schemes")
    @Operation(summary = "2.1 培养方案列表", description = "查询当前专业所有的培养方案列表(名称, 专业, 适用年级, 状态, 毕业要求大项数)")
    public Result<List<ProgramSchemeVO>> listSchemes() {
        Long directorId = UserContext.getUserId();
        List<ProgramSchemeVO> list = directorService.listSchemes(directorId);
        return Result.success(list);
    }

    @PostMapping("/schemes")
    @Operation(summary = "2.1 新建培养方案", description = "新建专业培养方案草稿")
    public Result<ProgramSchemeVO> createScheme(@RequestBody CreateSchemeDTO dto) {
        Long directorId = UserContext.getUserId();
        ProgramSchemeVO vo = directorService.createScheme(directorId, dto);
        return Result.success(vo);
    }

    @GetMapping("/schemes/{schemeId}/requirements")
    @Operation(summary = "2.1 毕业要求及指标点拆解表", description = "查询培养方案下所有的毕业要求大项及二级指标点拆解列表")
    public Result<List<GradRequirementVO>> listRequirements(@PathVariable("schemeId") Long schemeId) {
        List<GradRequirementVO> list = directorService.listRequirements(schemeId);
        return Result.success(list);
    }

    @PostMapping("/schemes/{schemeId}/requirements")
    @Operation(summary = "2.1 新增毕业要求大项与二级指标点", description = "录入毕业要求大项(如工程知识)并拆解二级指标点(1.1, 1.2)")
    public Result<String> createRequirement(@PathVariable("schemeId") Long schemeId, @RequestBody CreateRequirementDTO dto) {
        dto.setSchemeId(schemeId);
        Long directorId = UserContext.getUserId();
        directorService.createRequirement(directorId, dto);
        return Result.success("毕业要求及指标点录入成功");
    }

    @PostMapping("/schemes/{schemeId}/courses")
    @Operation(summary = "2.1 新增培养方案下属课程", description = "为指定的培养方案新增一门课程(如 SE-303 计算机网络)")
    public Result<com.eea.entity.Course> createCourse(@PathVariable("schemeId") Long schemeId, @RequestBody CreateCourseDTO dto) {
        dto.setSchemeId(schemeId);
        Long directorId = UserContext.getUserId();
        com.eea.entity.Course course = directorService.createCourse(directorId, dto);
        return Result.success(course);
    }

    // ==================== 2.2 矩阵配置与权重校验 ====================
    @GetMapping("/schemes/{schemeId}/matrix")
    @Operation(summary = "2.2 OBE 课程矩阵与权重配置表", description = "获取各课程对毕业要求二级指标点的支撑权重矩阵与权重和汇总")
    public Result<ObeMatrixVO> getObeMatrix(@PathVariable("schemeId") Long schemeId) {
        ObeMatrixVO matrix = directorService.getObeMatrix(schemeId);
        return Result.success(matrix);
    }

    @PostMapping("/schemes/{schemeId}/matrix/save")
    @Operation(summary = "2.2 保存 OBE 矩阵支撑权重", description = "批量更新课程目标对指标点的支撑权重系数 W")
    public Result<String> saveObeMatrix(@PathVariable("schemeId") Long schemeId, @RequestBody SaveMatrixDTO dto) {
        dto.setSchemeId(schemeId);
        Long directorId = UserContext.getUserId();
        directorService.saveObeMatrix(directorId, dto);
        return Result.success("权重矩阵配置保存成功");
    }

    @PostMapping("/schemes/{schemeId}/matrix/validate")
    @Operation(summary = "2.2 校验各指标点支撑权重和 ΣW = 1.000", description = "系统强制校验所有二级指标点的课程支撑权重和是否等于 1.000")
    public Result<String> validateObeMatrix(@PathVariable("schemeId") Long schemeId) {
        boolean valid = directorService.validateObeMatrix(schemeId);
        if (valid) {
            return Result.success("校验通过：所有二级指标点的课程支撑权重和均精确等于 1.000");
        } else {
            return Result.error(30002, "校验未通过：存在指标点的课程支撑权重和不等于 1.000，请修正后再归档");
        }
    }

    // ==================== 2.3 专业达成度总引擎 ====================
    @PostMapping("/schemes/{schemeId}/attainment/calculate")
    @Operation(summary = "2.3 专业/年级级毕业达成度计算总引擎", description = "执行公式 Degree(IP_j) = Σ W_{c,j} * A(CO_{c,j}) 并更新专业达成度固化表")
    public Result<List<DirectorAttainmentVO>> calculateGradAttainment(
            @PathVariable("schemeId") Long schemeId,
            @RequestParam(value = "grade", defaultValue = "2024") Integer grade) {
        List<DirectorAttainmentVO> list = directorService.calculateGradAttainment(schemeId, grade);
        return Result.success(list);
    }

    @GetMapping("/schemes/{schemeId}/attainment")
    @Operation(summary = "2.3 专业/年级毕业达成度计算表", description = "查看全专业在各二级指标点上的毕业达成度计算值与 0.680 预警状态")
    public Result<List<DirectorAttainmentVO>> listGradAttainment(
            @PathVariable("schemeId") Long schemeId,
            @RequestParam(value = "grade", defaultValue = "2024") Integer grade) {
        List<DirectorAttainmentVO> list = directorService.listGradAttainment(schemeId, grade);
        return Result.success(list);
    }

    // ==================== 2.4 专业认证自评报告 ====================
    @GetMapping("/schemes/{schemeId}/reports")
    @Operation(summary = "2.4 专业自评报告列表", description = "查看专业认证自评报告列表与导出状态")
    public Result<List<SelfReportVO>> listReports(@PathVariable("schemeId") Long schemeId) {
        List<SelfReportVO> list = directorService.listReports(schemeId);
        return Result.success(list);
    }

    @PostMapping("/schemes/{schemeId}/reports/generate")
    @Operation(summary = "2.4 生成/导出专业认证自评报告", description = "汇总专业毕业达成度与持续改进机制，导出认证自评报告")
    public Result<SelfReportVO> generateReport(@PathVariable("schemeId") Long schemeId, @RequestBody GenerateReportDTO dto) {
        dto.setSchemeId(schemeId);
        Long directorId = UserContext.getUserId();
        SelfReportVO report = directorService.generateReport(directorId, dto);
        return Result.success(report);
    }
}
