package com.eea.controller.teacher;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.common.UserContext;
import com.eea.dto.BatchScoreInputDTO;
import com.eea.dto.SaveImprovementDTO;
import com.eea.dto.UploadSampleDTO;
import com.eea.service.teacher.TeacherService;
import com.eea.vo.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teacher")
@Tag(name = "6.1 授课教师模块", description = "教学班花名册管理、小项成绩批量录入、总评计算、CO达成度引擎、教学改进与认证样品归档")
@RequireRoles("INSTRUCTOR")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    // ==================== 4.1 班级教学与花名册 ====================
    @GetMapping("/classes")
    @Operation(summary = "4.1 授课班级列表", description = "查询当前登录主讲教师的所有教学班级")
    public Result<List<TeacherClassVO>> listTeacherClasses() {
        Long teacherId = UserContext.getUserId();
        List<TeacherClassVO> list = teacherService.listTeacherClasses(teacherId);
        return Result.success(list);
    }

    @GetMapping("/classes/{classId}/students")
    @Operation(summary = "4.1 授课班级学生花名册", description = "查询指定教学班的学生花名册列表（学期, 教学班名称, 课程名称, 学号, 姓名, 行政班, 选课状态）")
    public Result<List<TeacherClassStudentVO>> listClassStudents(@PathVariable("classId") Long classId) {
        Long teacherId = UserContext.getUserId();
        List<TeacherClassStudentVO> list = teacherService.listClassStudents(teacherId, classId);
        return Result.success(list);
    }

    // ==================== 4.2 细项成绩网格录入表 ====================
    @GetMapping("/classes/{classId}/score-grid")
    @Operation(summary = "4.2 细项成绩网格表", description = "获取包含所有考核细项(试卷大题/作业/实验)表头与学生得分的数据网格")
    public Result<TeacherScoreGridVO> getScoreGrid(@PathVariable("classId") Long classId) {
        Long teacherId = UserContext.getUserId();
        TeacherScoreGridVO grid = teacherService.getScoreGrid(teacherId, classId);
        return Result.success(grid);
    }

    @PostMapping("/classes/{classId}/scores/batch")
    @Operation(summary = "4.2 批量网格保存细项成绩", description = "批量保存学生小项得分，防超满分校验(0 <= actualScore <= maxScore)")
    public Result<String> batchSaveScores(@PathVariable("classId") Long classId, @RequestBody BatchScoreInputDTO dto) {
        Long teacherId = UserContext.getUserId();
        teacherService.batchSaveScores(teacherId, classId, dto);
        return Result.success("成绩保存成功");
    }

    // ==================== 4.3 班级总评成绩单表 ====================
    @GetMapping("/classes/{classId}/final-scores")
    @Operation(summary = "4.3 班级总评成绩单表", description = "系统自动按考核权重折算平时/实验/期末成绩并计算综合总评成绩与及格状态")
    public Result<List<TeacherFinalScoreVO>> listFinalScores(@PathVariable("classId") Long classId) {
        Long teacherId = UserContext.getUserId();
        List<TeacherFinalScoreVO> list = teacherService.calculateAndListFinalScores(teacherId, classId);
        return Result.success(list);
    }

    // ==================== 4.4 班级 CO 达成度计算表 ====================
    @PostMapping("/classes/{classId}/attainment/calculate")
    @Operation(summary = "4.4 班级 CO 达成度一键计算引擎", description = "执行工程认证达成度公式 A(COk) = Σ(Wm * Savg,m) / Σ(Wm * Smax,m) 并更新 course_attainment 表")
    public Result<List<TeacherCoAttainmentVO>> calculateCoAttainment(@PathVariable("classId") Long classId) {
        Long teacherId = UserContext.getUserId();
        List<TeacherCoAttainmentVO> list = teacherService.calculateCoAttainment(teacherId, classId);
        return Result.success(list);
    }

    @GetMapping("/classes/{classId}/attainment")
    @Operation(summary = "4.4 班级 CO 达成度计算表", description = "查看班级各课程目标达成度实测值与 0.680 预警线状态")
    public Result<List<TeacherCoAttainmentVO>> listCoAttainment(@PathVariable("classId") Long classId) {
        Long teacherId = UserContext.getUserId();
        List<TeacherCoAttainmentVO> list = teacherService.listCoAttainment(teacherId, classId);
        return Result.success(list);
    }

    // ==================== 4.5 班级教学改进反思表 ====================
    @GetMapping("/classes/{classId}/improvements")
    @Operation(summary = "4.5 班级教学改进反思表", description = "查看班级低达成度目标原因分析与拟采取的教学改进措施")
    public Result<List<TeachingImprovementVO>> listImprovements(@PathVariable("classId") Long classId) {
        Long teacherId = UserContext.getUserId();
        List<TeachingImprovementVO> list = teacherService.listImprovements(teacherId, classId);
        return Result.success(list);
    }

    @PostMapping("/classes/{classId}/improvements")
    @Operation(summary = "4.5 提交班级教学改进反思", description = "对低于 0.680 警戒线的目标提交原因分析与改进措施")
    public Result<String> saveImprovement(@PathVariable("classId") Long classId, @RequestBody SaveImprovementDTO dto) {
        Long teacherId = UserContext.getUserId();
        teacherService.saveImprovement(teacherId, classId, dto);
        return Result.success("教学改进反思报告提交成功");
    }

    // ==================== 4.6 认证样品归档表 ====================
    @GetMapping("/classes/{classId}/samples")
    @Operation(summary = "4.6 认证样品归档表", description = "查看教学班高/中/低(优秀/中等/不及格)三档归档样品列表")
    public Result<List<EvidenceSampleVO>> listSamples(@PathVariable("classId") Long classId) {
        Long teacherId = UserContext.getUserId();
        List<EvidenceSampleVO> list = teacherService.listSamples(teacherId, classId);
        return Result.success(list);
    }

    @PostMapping("/classes/{classId}/samples")
    @Operation(summary = "4.6 上传认证归档样品", description = "上传试卷、作业、实验报告 PDF 扫描件并完成样本归档")
    public Result<String> uploadSample(@PathVariable("classId") Long classId, @RequestBody UploadSampleDTO dto) {
        Long teacherId = UserContext.getUserId();
        teacherService.uploadSample(teacherId, classId, dto);
        return Result.success("认证归档样品提交成功");
    }
}
