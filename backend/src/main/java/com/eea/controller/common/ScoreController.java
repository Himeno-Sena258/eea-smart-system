package com.eea.controller.common;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.dto.BatchScoreInputDTO;
import com.eea.entity.*;
import com.eea.mapper.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * §7.2 分项成绩录入 — 对应文档路径 /teaching-classes/{teachingClassId}/scores
 */
@RestController
@RequestMapping("/teaching-classes/{teachingClassId}/scores")
@Tag(name = "7.2 分项成绩录入", description = "成绩网格表查询、批量保存、Excel导入导出")
public class ScoreController {

    @Autowired private StudentScoreMapper studentScoreMapper;
    @Autowired private AssessmentItemMapper itemMapper;
    @Autowired private AssessmentMethodMapper methodMapper;
    @Autowired private TeachingClassStudentMapper tcsMapper;
    @Autowired private TeachingClassMapper tcMapper;
    @Autowired private StudentInfoMapper studentInfoMapper;
    @Autowired private SysUserMapper sysUserMapper;

    /** 查询教学班成绩网格表 */
    @GetMapping
    @RequireRoles({"INSTRUCTOR", "COORDINATOR"})
    @Operation(summary = "查询教学班成绩表", description = "返回学生×考核细项的二维成绩网格")
    public Result<List<Map<String, Object>>> getScoreGrid(@PathVariable Long teachingClassId) {
        // 学生列表
        QueryWrapper<TeachingClassStudent> tcsW = new QueryWrapper<>();
        tcsW.eq("teaching_class_id", teachingClassId);
        List<TeachingClassStudent> tcsList = tcsMapper.selectList(tcsW);

        // 教学班 → 课程 → 考核细项
        TeachingClass tc = tcMapper.selectById(teachingClassId);
        QueryWrapper<AssessmentMethod> methodW = new QueryWrapper<>();
        methodW.eq("course_id", tc != null ? tc.getCourseId() : null);
        List<AssessmentMethod> methods = methodMapper.selectList(methodW);

        List<Map<String, Object>> grid = new ArrayList<>();
        for (TeachingClassStudent tcs : tcsList) {
            Map<String, Object> row = new LinkedHashMap<>();
            SysUser user = sysUserMapper.selectById(tcs.getStudentId());
            StudentInfo si = studentInfoMapper.selectById(tcs.getStudentId());
            row.put("studentId", tcs.getStudentId());
            row.put("studentNo", si != null ? si.getStudentNo() : "");
            row.put("realName", user != null ? user.getRealName() : "");

            // 各细项得分
            for (AssessmentMethod method : methods) {
                QueryWrapper<AssessmentItem> itemW = new QueryWrapper<>();
                itemW.eq("method_id", method.getId());
                List<AssessmentItem> items = itemMapper.selectList(itemW);
                for (AssessmentItem item : items) {
                    QueryWrapper<StudentScore> scoreW = new QueryWrapper<>();
                    scoreW.eq("student_id", tcs.getStudentId())
                           .eq("assessment_item_id", item.getId());
                    StudentScore score = studentScoreMapper.selectOne(scoreW);
                    row.put("item_" + item.getId(), score != null ? score.getActualScore() : null);
                }
            }
            grid.add(row);
        }
        return Result.success(grid);
    }

    /** 批量保存成绩 */
    @PutMapping
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "批量保存成绩")
    public Result<String> batchSave(@PathVariable Long teachingClassId,
                                     @RequestBody BatchScoreInputDTO dto) {
        for (BatchScoreInputDTO.SingleScoreItem entry : dto.getScores()) {
            QueryWrapper<StudentScore> w = new QueryWrapper<>();
            w.eq("student_id", entry.getStudentId())
             .eq("assessment_item_id", entry.getAssessmentItemId());
            StudentScore exist = studentScoreMapper.selectOne(w);

            AssessmentItem item = itemMapper.selectById(entry.getAssessmentItemId());
            if (item != null && item.getMaxScore() != null
                    && entry.getActualScore().compareTo(item.getMaxScore()) > 0) {
                return Result.error(42005, "分数超过考核细项满分: " + item.getName());
            }

            if (exist != null) {
                exist.setActualScore(entry.getActualScore());
                studentScoreMapper.updateById(exist);
            } else {
                StudentScore s = new StudentScore();
                s.setStudentId(entry.getStudentId());
                s.setAssessmentItemId(entry.getAssessmentItemId());
                s.setActualScore(entry.getActualScore());
                studentScoreMapper.insert(s);
            }
        }
        return Result.success("成绩保存成功");
    }
}
