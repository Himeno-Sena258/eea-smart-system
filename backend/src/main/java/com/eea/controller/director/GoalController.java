package com.eea.controller.director;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/program-schemes")
@Tag(name = "5.07 培养目标管理", description = "对应文档 §5.7：培养目标的查询、新增、修改与删除")
@RequireRoles({"DIRECTOR", "ADMIN"})
public class GoalController {

    @GetMapping("/{schemeId}/education-goals")
    @Operation(summary = "查询培养目标")
    public Result<List<Map<String, Object>>> listEducationGoals(@PathVariable("schemeId") Long schemeId) {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> goal = new HashMap<>();
        goal.put("id", 1L);
        goal.put("schemeId", schemeId);
        goal.put("code", "PEO1");
        goal.put("content", "具备良好的工程职业素养，能够在软件工程相关领域从事系统分析、设计、开发与管理工作。");
        goal.put("sortOrder", 1);
        list.add(goal);
        return Result.success(list);
    }

    @PostMapping("/{schemeId}/education-goals")
    @Operation(summary = "新增培养目标")
    public Result<Map<String, Object>> createEducationGoal(@PathVariable("schemeId") Long schemeId, @RequestBody Map<String, Object> body) {
        body.put("id", 1L);
        body.put("schemeId", schemeId);
        return Result.success(body);
    }

    @PutMapping("/education-goals/{id}")
    @Operation(summary = "修改培养目标")
    public Result<Map<String, Object>> updateEducationGoal(@PathVariable("id") Long id, @RequestBody Map<String, Object> body) {
        body.put("id", id);
        return Result.success(body);
    }

    @DeleteMapping("/education-goals/{id}")
    @Operation(summary = "删除培养目标")
    public Result<String> deleteEducationGoal(@PathVariable("id") Long id) {
        return Result.success("培养目标删除成功");
    }
}
