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
@RequestMapping("/program-schemes/{schemeId}/goal-requirement-matrix")
@Tag(name = "5.11 培养目标-毕业要求矩阵", description = "对应文档 §5.11：培养目标-毕业要求矩阵")
@RequireRoles({"DIRECTOR", "ADMIN"})
public class GoalRequirementMatrixController {

    @GetMapping
    @Operation(summary = "查询培养目标与毕业要求矩阵")
    public Result<List<Map<String, Object>>> getMatrix(@PathVariable("schemeId") Long schemeId) {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> item = new HashMap<>();
        item.put("educationGoalId", 1L);
        item.put("requirementId", 1L);
        item.put("supportLevel", "H");
        list.add(item);
        return Result.success(list);
    }

    @PutMapping
    @Operation(summary = "保存培养目标与毕业要求矩阵")
    public Result<String> saveMatrix(@PathVariable("schemeId") Long schemeId, @RequestBody Map<String, Object> body) {
        return Result.success("培养目标与毕业要求矩阵保存成功");
    }

    @DeleteMapping
    @Operation(summary = "清空矩阵")
    public Result<String> clearMatrix(@PathVariable("schemeId") Long schemeId) {
        return Result.success("矩阵已清空");
    }
}
