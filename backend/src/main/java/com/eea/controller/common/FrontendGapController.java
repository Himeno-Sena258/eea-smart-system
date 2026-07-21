package com.eea.controller.common;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.*;
import com.eea.entity.*;
import com.eea.mapper.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/** 前端剩余需求: §1.1,§2.2,§3.1,§4.1,§6.1,§8.2 */
@RestController @Tag(name="前端接入补充")
public class FrontendGapController {

    // ===== §1.1 清空课程指标矩阵 =====
    @Autowired private CourseObjIndicatorMapMapper coiMapper;
    @Autowired private CourseObjectiveMapper courseObjectiveMapper;
    @DeleteMapping("/courses/{courseId}/indicator-matrix")
    @RequireRoles({"DIRECTOR","ADMIN"})
    @Operation(summary="§1.1 清空单门课程指标矩阵")
    public Result<String> clearMatrix(@PathVariable Long courseId){
        QueryWrapper<CourseObjective> objW=new QueryWrapper<>();
        objW.eq("course_id",courseId);
        List<CourseObjective> objs=courseObjectiveMapper.selectList(objW);
        for(CourseObjective obj:objs){
            QueryWrapper<CourseObjIndicatorMap> w=new QueryWrapper<>();
            w.eq("course_objective_id",obj.getId());
            coiMapper.delete(w);
        }
        return Result.success("矩阵关系已清空");
    }

    // ===== §2.2 教学内容 =====
    @Autowired private CourseTeachingContentMapper ctcMapper;
    @GetMapping("/courses/{courseId}/teaching-contents")
    @Operation(summary="§2.2 教学内容列表")
    public Result<List<CourseTeachingContent>> listTC(@PathVariable Long courseId){
        QueryWrapper<CourseTeachingContent> w=new QueryWrapper<>();
        w.eq("course_id",courseId).orderByAsc("sort_order");
        return Result.success(ctcMapper.selectList(w));
    }
    @PutMapping("/courses/{courseId}/teaching-contents")
    @RequireRoles({"COORDINATOR","ADMIN"})
    @Operation(summary="§2.2 保存教学内容")
    public Result<String> saveTC(@PathVariable Long courseId,@RequestBody Map<String,Object> body){
        QueryWrapper<CourseTeachingContent> dw=new QueryWrapper<>();
        dw.eq("course_id",courseId); ctcMapper.delete(dw);
        List<Map<String,Object>> items=(List<Map<String,Object>>)body.get("items");
        if(items!=null) for(Map<String,Object> it:items){
            CourseTeachingContent c=new CourseTeachingContent();
            c.setCourseId(courseId);
            c.setTitle((String)it.get("title"));
            c.setHours(it.get("hours")!=null?((Number)it.get("hours")).intValue():0);
            c.setObjectiveIds(it.get("objectiveIds")!=null?it.get("objectiveIds").toString():"");
            c.setSortOrder(it.get("sortOrder")!=null?((Number)it.get("sortOrder")).intValue():0);
            ctcMapper.insert(c);
        }
        return Result.success("保存成功");
    }

    // ===== §3.1 考核评分标准 =====
    @Autowired private AssessmentStandardMapper asMapper;
    @GetMapping("/assessment-items/{itemId}/standards")
    @Operation(summary="§3.1 评分标准列表")
    public Result<List<AssessmentStandard>> listAS(@PathVariable Long itemId){
        QueryWrapper<AssessmentStandard> w=new QueryWrapper<>();
        w.eq("assessment_item_id",itemId);
        return Result.success(asMapper.selectList(w));
    }
    @PutMapping("/assessment-items/{itemId}/standards")
    @RequireRoles({"COORDINATOR","ADMIN"})
    @Operation(summary="§3.1 保存评分标准")
    public Result<String> saveAS(@PathVariable Long itemId,@RequestBody Map<String,Object> body){
        QueryWrapper<AssessmentStandard> dw=new QueryWrapper<>();
        dw.eq("assessment_item_id",itemId); asMapper.delete(dw);
        List<Map<String,Object>> items=(List<Map<String,Object>>)body.get("standards");
        if(items!=null) for(Map<String,Object> it:items){
            AssessmentStandard a=new AssessmentStandard();
            a.setAssessmentItemId(itemId);
            a.setLevel((String)it.get("level"));
            a.setMinScore(new java.math.BigDecimal(it.get("minScore").toString()));
            a.setMaxScore(new java.math.BigDecimal(it.get("maxScore").toString()));
            a.setDescription((String)it.get("description"));
            asMapper.insert(a);
        }
        return Result.success("保存成功");
    }

    // ===== §4.1 佐证材料 =====
    @Autowired private EvidenceMaterialMapper emMapper;
    @GetMapping("/teaching-classes/{teachingClassId}/evidence-materials")
    @Operation(summary="§4.1 佐证材料列表")
    public Result<List<EvidenceMaterial>> listEM(@PathVariable Long teachingClassId){
        QueryWrapper<EvidenceMaterial> w=new QueryWrapper<>();
        w.eq("teaching_class_id",teachingClassId);
        return Result.success(emMapper.selectList(w));
    }
    @PostMapping("/teaching-classes/{teachingClassId}/evidence-materials")
    @RequireRoles({"INSTRUCTOR","ADMIN"})
    @Operation(summary="§4.1 上传佐证材料")
    public Result<EvidenceMaterial> uploadEM(@PathVariable Long teachingClassId,@RequestBody EvidenceMaterial e){
        e.setTeachingClassId(teachingClassId); emMapper.insert(e); return Result.success(e);
    }
    @DeleteMapping("/evidence-materials/{id}")
    @RequireRoles({"INSTRUCTOR","ADMIN"})
    @Operation(summary="§4.1 删除佐证材料")
    public Result<String> deleteEM(@PathVariable Long id){ emMapper.deleteById(id); return Result.success("删除成功"); }
    @GetMapping("/evidence-materials/{id}/download")
    @Operation(summary="§4.1 下载佐证材料")
    public Result<Map<String,String>> downloadEM(@PathVariable Long id){
        EvidenceMaterial e=emMapper.selectById(id);
        Map<String,String> m=new LinkedHashMap<>();
        m.put("filePath",e!=null?e.getFilePath():"");
        m.put("fileName",e!=null?e.getFileName():"");
        return Result.success(m);
    }

    // ===== §6.1 问卷题目 =====
    @Autowired private SurveyQuestionMapper sqMapper;
    @GetMapping("/surveys/{id}/questions")
    @Operation(summary="§6.1 问卷题目列表")
    public Result<List<SurveyQuestion>> listSQ(@PathVariable Long id){
        QueryWrapper<SurveyQuestion> w=new QueryWrapper<>();
        w.eq("questionnaire_id",id).orderByAsc("sort_order");
        return Result.success(sqMapper.selectList(w));
    }
    @PutMapping("/surveys/{id}/questions")
    @RequireRoles({"DIRECTOR","ADMIN"})
    @Operation(summary="§6.1 保存问卷题目")
    public Result<String> saveSQ(@PathVariable Long id,@RequestBody List<SurveyQuestion> questions){
        QueryWrapper<SurveyQuestion> dw=new QueryWrapper<>();
        dw.eq("questionnaire_id",id); sqMapper.delete(dw);
        for(SurveyQuestion q:questions){ q.setQuestionnaireId(id); sqMapper.insert(q); }
        return Result.success("保存成功");
    }

    // ===== §8.2 改进审核 =====
    @Autowired private ContinuousImprovementMapper ciMapper;
    @PutMapping("/improvements/{id}/review")
    @RequireRoles({"DIRECTOR","COORDINATOR"})
    @Operation(summary="§8.2 审阅改进记录")
    public Result<String> review(@PathVariable Long id,@RequestBody Map<String,Object> body){
        ContinuousImprovement ci=ciMapper.selectById(id);
        if(ci==null) return Result.error(50001,"记录不存在");
        if(body.get("status")!=null) ci.setStatus(((Number)body.get("status")).intValue());
        if(body.get("reviewerComment")!=null) ci.setReviewerComment((String)body.get("reviewerComment"));
        ci.setReviewedAt(java.time.LocalDateTime.now());
        ciMapper.updateById(ci);
        return Result.success("审阅完成");
    }
}
