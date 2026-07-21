package com.eea.controller.common;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eea.common.*;
import com.eea.entity.*;
import com.eea.mapper.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * §10.1 问卷管理 + §10.2 问卷提交与统计
 */
@RestController
@RequestMapping("/surveys")
@Tag(name = "10.1 问卷管理", description = "问卷 CRUD、开放/关闭、答卷提交与统计")
public class SurveyController {

    @Autowired private SurveyQuestionnaireMapper qMapper;
    @Autowired private SurveyAnswerMapper aMapper;
    private static final ObjectMapper om = new ObjectMapper();

    // ===== §10.1 问卷 CRUD =====
    @GetMapping
    @Operation(summary = "分页查询问卷")
    public Result<PageResult<SurveyQuestionnaire>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<SurveyQuestionnaire> p = qMapper.selectPage(new Page<>(pageNum, pageSize),
                new QueryWrapper<SurveyQuestionnaire>().orderByDesc("created_at"));
        return Result.success(PageResult.build(p.getRecords(), p.getCurrent(), p.getSize(), p.getTotal()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取问卷详情")
    public Result<SurveyQuestionnaire> getById(@PathVariable Long id) {
        return Result.success(qMapper.selectById(id));
    }

    @PostMapping
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "创建问卷")
    public Result<SurveyQuestionnaire> create(@RequestBody SurveyQuestionnaire q) {
        q.setCreatedAt(LocalDateTime.now());
        qMapper.insert(q);
        return Result.success(q);
    }

    @PutMapping("/{id}")
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "修改问卷")
    public Result<String> update(@PathVariable Long id, @RequestBody SurveyQuestionnaire q) {
        q.setId(id);
        qMapper.updateById(q);
        return Result.success("修改成功");
    }

    @PutMapping("/{id}/open")
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "开放问卷")
    public Result<String> open(@PathVariable Long id) {
        SurveyQuestionnaire q = qMapper.selectById(id);
        if (q == null) throw BusinessException.notFound("问卷不存在");
        q.setStatus(1);
        qMapper.updateById(q);
        return Result.success("问卷已开放");
    }

    @PutMapping("/{id}/close")
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "关闭问卷")
    public Result<String> close(@PathVariable Long id) {
        SurveyQuestionnaire q = qMapper.selectById(id);
        if (q == null) throw BusinessException.notFound("问卷不存在");
        q.setStatus(0);
        qMapper.updateById(q);
        return Result.success("问卷已关闭");
    }

    @DeleteMapping("/{id}")
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "删除问卷")
    public Result<String> delete(@PathVariable Long id) {
        qMapper.deleteById(id);
        return Result.success("删除成功");
    }

    // ===== §10.2 答卷 =====
    @GetMapping("/answers/my")
    @Operation(summary = "查询当前用户已提交答卷")
    public Result<List<Map<String, Object>>> myAnswers() {
        Long userId = UserContext.getUserId();
        if (userId == null) throw BusinessException.unauthorized();

        QueryWrapper<SurveyAnswer> w = new QueryWrapper<>();
        w.eq("user_id", userId).orderByDesc("submitted_at");
        List<Map<String, Object>> answers = aMapper.selectList(w).stream().map(answer -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", answer.getId());
            item.put("questionnaireId", answer.getQuestionnaireId());
            item.put("submittedAt", answer.getSubmittedAt());
            return item;
        }).toList();
        return Result.success(answers);
    }

    @PostMapping("/{id}/answers")
    @Operation(summary = "提交问卷答案")
    public Result<String> submitAnswer(@PathVariable Long id,
                                        @RequestBody Map<String, Object> body) {
        Long userId = UserContext.getUserId();
        if (userId == null) throw BusinessException.unauthorized();

        QueryWrapper<SurveyAnswer> w = new QueryWrapper<>();
        w.eq("questionnaire_id", id).eq("user_id", userId);
        if (aMapper.exists(w)) throw new BusinessException(80003, "问卷已提交");

        try {
            SurveyAnswer a = new SurveyAnswer();
            a.setQuestionnaireId(id);
            a.setUserId(userId);
            a.setRawAnswersJson(om.writeValueAsString(body));
            a.setSubmittedAt(LocalDateTime.now());
            aMapper.insert(a);
            return Result.success("提交成功");
        } catch (Exception e) {
            throw new BusinessException(80004, "答案格式非法");
        }
    }

    @GetMapping("/{id}/answers")
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "查询答卷列表")
    public Result<List<SurveyAnswer>> listAnswers(@PathVariable Long id) {
        QueryWrapper<SurveyAnswer> w = new QueryWrapper<>();
        w.eq("questionnaire_id", id);
        return Result.success(aMapper.selectList(w));
    }

    @GetMapping("/{id}/statistics")
    @RequireRoles({"ADMIN", "DIRECTOR"})
    @Operation(summary = "查询问卷统计结果")
    public Result<Map<String, Object>> statistics(@PathVariable Long id) {
        SurveyQuestionnaire q = qMapper.selectById(id);
        QueryWrapper<SurveyAnswer> w = new QueryWrapper<>();
        w.eq("questionnaire_id", id);
        List<SurveyAnswer> answers = aMapper.selectList(w);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("questionnaireId", id);
        stats.put("title", q != null ? q.getTitle() : "");
        stats.put("totalAnswers", answers.size());
        stats.put("answers", answers);
        return Result.success(stats);
    }
}
