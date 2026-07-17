package com.eea.controller.student;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.common.UserContext;
import com.eea.dto.SubmitSurveyDTO;
import com.eea.service.student.*;
import com.eea.vo.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
@Tag(name = "学生模块")
@RequireRoles("STUDENT")
public class StudentController {

    @Autowired
    private StudentScoreService scoreService;
    @Autowired
    private StudentAttainmentService attainmentService;
    @Autowired
    private StudentSyllabusService syllabusService;
    @Autowired
    private StudentSurveyService surveyService;

    // ==================== 5.2 综合成绩总表 ====================
    @GetMapping("/scores")
    @Operation(summary = "5.2 综合成绩总表", description = "查询本人所有课程的平时/实验/期末/总评成绩")
    public Result<List<StudentCourseScoreVO>> listScores() {
        Long studentId = UserContext.getUserId();
        return Result.success(scoreService.listCourseScores(studentId));
    }

    // ==================== 5.1 课程小项分文明细 ====================
    @GetMapping("/scores/{teachingClassId}/detail")
    @Operation(summary = "5.1 课程小项分文明细", description = "查看某门课每道题/作业小项的实际得分与满分")
    public Result<StudentCourseScoreVO> getScoreDetail(
            @PathVariable Long teachingClassId) {
        Long studentId = UserContext.getUserId();
        return Result.success(scoreService.getScoreDetail(studentId, teachingClassId));
    }

    // ==================== 5.3 个人毕业要求达成 ====================
    @GetMapping("/attainment")
    @Operation(summary = "5.3 个人毕业要求达成表", description = "查看个人在全部二级指标点上的达成度实测值与达标状态")
    public Result<List<StudentAttainmentVO>> listAttainment() {
        Long studentId = UserContext.getUserId();
        return Result.success(attainmentService.listAttainment(studentId));
    }

    // ==================== 5.4 课程大纲查阅 ====================
    @GetMapping("/syllabus")
    @Operation(summary = "5.4 课程大纲列表", description = "查看所修课程的大纲摘要")
    public Result<List<StudentSyllabusVO>> listSyllabus() {
        Long studentId = UserContext.getUserId();
        return Result.success(syllabusService.listSyllabus(studentId));
    }

    @GetMapping("/syllabus/{courseId}")
    @Operation(summary = "5.4 课程大纲详情", description = "查看某门课的教学目标、考核方式与支撑指标点")
    public Result<StudentSyllabusVO> getSyllabusDetail(@PathVariable Long courseId) {
        Long studentId = UserContext.getUserId();
        return Result.success(syllabusService.getSyllabusDetail(studentId, courseId));
    }

    // ==================== 5.5 问卷 ====================
    @GetMapping("/surveys")
    @Operation(summary = "5.5 问卷列表", description = "查看可填写的问卷及提交状态")
    public Result<List<StudentSurveyVO>> listSurveys() {
        Long studentId = UserContext.getUserId();
        return Result.success(surveyService.listSurveys(studentId));
    }

    @GetMapping("/surveys/{id}")
    @Operation(summary = "5.5 问卷详情", description = "查看问卷题目（单选/多选/文本）")
    public Result<StudentSurveyVO> getSurveyDetail(@PathVariable Long id) {
        Long studentId = UserContext.getUserId();
        return Result.success(surveyService.getSurveyDetail(studentId, id));
    }

    @PostMapping("/surveys/{id}/submit")
    @Operation(summary = "5.5 提交问卷", description = "提交问卷答案 JSON")
    public Result<String> submitSurvey(@PathVariable Long id, @RequestBody SubmitSurveyDTO dto) {
        dto.setQuestionnaireId(id);
        Long studentId = UserContext.getUserId();
        surveyService.submitSurvey(studentId, dto);
        return Result.success("问卷提交成功");
    }
}
