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

/**
 * §11 持续改进模块
 */
@RestController
@Tag(name = "11.0 持续改进", description = "班级持续改进记录 CRUD 与自动生成草稿")
public class ImprovementController {

    @Autowired private ContinuousImprovementMapper ciMapper;
    @Autowired private CourseAttainmentMapper caMapper;

    @GetMapping("/teaching-classes/{teachingClassId}/improvements")
    @Operation(summary = "查询持续改进记录")
    public Result<List<ContinuousImprovement>> list(@PathVariable Long teachingClassId) {
        QueryWrapper<ContinuousImprovement> w = new QueryWrapper<>();
        w.eq("teaching_class_id", teachingClassId).orderByDesc("created_at");
        return Result.success(ciMapper.selectList(w));
    }

    @PostMapping("/teaching-classes/{teachingClassId}/improvements")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "新增持续改进记录")
    public Result<ContinuousImprovement> create(@PathVariable Long teachingClassId,
                                                 @RequestBody ContinuousImprovement ci) {
        ci.setTeachingClassId(teachingClassId);
        ciMapper.insert(ci);
        return Result.success(ci);
    }

    @PutMapping("/improvements/{id}")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "修改持续改进记录")
    public Result<String> update(@PathVariable Long id, @RequestBody ContinuousImprovement ci) {
        ci.setId(id);
        ciMapper.updateById(ci);
        return Result.success("修改成功");
    }

    @DeleteMapping("/improvements/{id}")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "删除持续改进记录")
    public Result<String> delete(@PathVariable Long id) {
        ciMapper.deleteById(id);
        return Result.success("删除成功");
    }

    @PostMapping("/teaching-classes/{teachingClassId}/improvements/generate")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "根据达成度结果生成分析草稿")
    public Result<Map<String, Object>> generate(@PathVariable Long teachingClassId) {
        QueryWrapper<CourseAttainment> w = new QueryWrapper<>();
        w.eq("teaching_class_id", teachingClassId);
        List<CourseAttainment> list = caMapper.selectList(w);

        List<String> lowCOs = new ArrayList<>();
        for (CourseAttainment ca : list) {
            if (ca.getAttainmentVal() != null && ca.getAttainmentVal().doubleValue() < 0.68) {
                lowCOs.add("CO" + ca.getCourseObjectiveId() + "=" + ca.getAttainmentVal());
            }
        }

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("teachingClassId", teachingClassId);
        draft.put("lowAttainmentCOs", lowCOs);
        draft.put("suggestedAnalysis", lowCOs.isEmpty()
                ? "所有课程目标达成度均在阈值(0.68)以上"
                : "以下课程目标达成度低于阈值(0.68)，建议分析原因：" + String.join(", ", lowCOs));
        return Result.success(draft);
    }
}
