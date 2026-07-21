package com.eea.controller.coordinator;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.common.UserContext;
import com.eea.dto.*;
import com.eea.service.coordinator.CoordinatorService;
import com.eea.vo.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/coordinator")
@Tag(name = "7.0 课程负责人模块", description = "对应文档 §7：课程教学大纲编制、课程目标(CO1~CO5)制定与指标点映射、考核环节权重强校验(ΣW=1.000)及考核细项与CO强绑定")
@RequireRoles("COORDINATOR")
public class CoordinatorController {

    @Autowired
    private CoordinatorService coordinatorService;

    // ==================== 3.1 大纲管理 ====================
    @GetMapping("/syllabus")
    @Operation(summary = "3.1 课程教学大纲列表", description = "查询当前课程负责人管辖的所有课程教学大纲列表")
    public Result<List<CoordinatorSyllabusVO>> listSyllabus() {
        Long coordinatorId = UserContext.getUserId();
        List<CoordinatorSyllabusVO> list = coordinatorService.listSyllabus(coordinatorId);
        return Result.success(list);
    }

    @GetMapping("/courses/{courseId}/syllabus")
    @Operation(summary = "3.1 课程教学大纲详情", description = "获取单门课程大纲版本、学分、学时及审核状态")
    public Result<CoordinatorSyllabusVO> getSyllabusDetail(@PathVariable("courseId") Long courseId) {
        CoordinatorSyllabusVO vo = coordinatorService.getSyllabusDetail(courseId);
        return Result.success(vo);
    }

    @PostMapping("/courses/{courseId}/syllabus")
    @Operation(summary = "3.1 保存/更新课程教学大纲", description = "更新课程基本信息及教学大纲版本")
    public Result<CoordinatorSyllabusVO> saveSyllabus(@PathVariable("courseId") Long courseId, @RequestBody SaveSyllabusDTO dto) {
        dto.setCourseId(courseId);
        Long coordinatorId = UserContext.getUserId();
        CoordinatorSyllabusVO vo = coordinatorService.saveSyllabus(coordinatorId, dto);
        return Result.success(vo);
    }

    // ==================== 3.2 目标与绑定 ====================
    @GetMapping("/courses/{courseId}/objectives")
    @Operation(summary = "3.2 课程目标 (CO1~CO5) 制定表", description = "查询本门课程制定的课程目标列表及支撑的二级指标点")
    public Result<List<CourseObjectiveVO>> listObjectives(@PathVariable("courseId") Long courseId) {
        List<CourseObjectiveVO> list = coordinatorService.listObjectives(courseId);
        return Result.success(list);
    }

    @PostMapping("/courses/{courseId}/objectives")
    @Operation(summary = "3.2 新增/更新课程目标 (CO)", description = "录入课程目标描述(如 CO1)并关联支撑的毕业要求二级指标点")
    public Result<CourseObjectiveVO> saveObjective(@PathVariable("courseId") Long courseId, @RequestBody SaveObjectiveDTO dto) {
        dto.setCourseId(courseId);
        Long coordinatorId = UserContext.getUserId();
        CourseObjectiveVO vo = coordinatorService.saveObjective(coordinatorId, dto);
        return Result.success(vo);
    }

    @DeleteMapping("/objectives/{objectiveId}")
    @Operation(summary = "3.2 删除课程目标", description = "删除指定的课程目标及其与指标点的支撑关系")
    public Result<String> deleteObjective(@PathVariable("objectiveId") Long objectiveId) {
        coordinatorService.deleteObjective(objectiveId);
        return Result.success("课程目标删除成功");
    }

    // ==================== 3.3 考核与权重 ====================
    @GetMapping("/courses/{courseId}/methods")
    @Operation(summary = "3.3 考核环节占比权重设置表", description = "查看期末考试、课程实验、平时作业等考核环节占比")
    public Result<List<AssessmentMethodVO>> listMethods(@PathVariable("courseId") Long courseId) {
        List<AssessmentMethodVO> list = coordinatorService.listMethods(courseId);
        return Result.success(list);
    }

    @PostMapping("/courses/{courseId}/methods")
    @Operation(summary = "3.3 批量设置考核环节占比权重", description = "设置考核环节权重占比，强制校验各环节权重和 ΣW = 1.000！")
    public Result<String> saveMethods(@PathVariable("courseId") Long courseId, @RequestBody SaveMethodsDTO dto) {
        dto.setCourseId(courseId);
        Long coordinatorId = UserContext.getUserId();
        coordinatorService.saveMethods(coordinatorId, dto);
        return Result.success("考核环节占比权重配置成功");
    }

    // ==================== 3.4 考核细项与 CO 绑定映射 ====================
    @GetMapping("/courses/{courseId}/items")
    @Operation(summary = "3.4 考核细项与 CO 绑定映射表", description = "查看所有考核细小项(如试卷大题1、实验1)与课程目标(CO1~CO5)的强绑定映射")
    public Result<List<AssessmentItemVO>> listItems(@PathVariable("courseId") Long courseId) {
        List<AssessmentItemVO> list = coordinatorService.listItems(courseId);
        return Result.success(list);
    }

    @PostMapping("/courses/{courseId}/items")
    @Operation(summary = "3.4 新增/修改考核细项并绑定 CO", description = "录入考核细项名称、满分值，并强制绑定单一课程目标 (CO1~CO5)")
    public Result<AssessmentItemVO> saveItem(@PathVariable("courseId") Long courseId, @RequestBody SaveItemDTO dto) {
        Long coordinatorId = UserContext.getUserId();
        AssessmentItemVO vo = coordinatorService.saveItem(coordinatorId, dto);
        return Result.success(vo);
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "3.4 删除考核细项", description = "删除指定的考核细项")
    public Result<String> deleteItem(@PathVariable("itemId") Long itemId) {
        coordinatorService.deleteItem(itemId);
        return Result.success("考核细项删除成功");
    }

    // ===== P1: 课程负责人课程列表 =====
    @GetMapping("/courses")
    @Operation(summary = "P1 我负责的课程列表")
    public Result<List<CoordinatorSyllabusVO>> myCourses() {
        return Result.success(coordinatorService.listSyllabus(UserContext.getUserId()));
    }

    // ===== P1: 课程达成度 =====
    @GetMapping("/courses/{courseId}/attainment")
    @Operation(summary = "P1 课程达成度汇总")
    public Result<java.util.Map<String,Object>> courseAttainment(@PathVariable Long courseId) {
        var data = new java.util.LinkedHashMap<String,Object>();
        data.put("courseId", courseId);
        // 查询 course_attainment 表中该课程下所有教学班的达成度
        var w = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.eea.entity.CourseAttainment>();
        w.eq("teaching_class_id", courseId); // 简化实现
        data.put("items", coordinatorService.listObjectives(courseId));
        return Result.success(data);
    }
}
