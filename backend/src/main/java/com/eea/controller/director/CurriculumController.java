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
@RequestMapping("/program-schemes/{schemeId}/curriculum")
@Tag(name = "5.12 课程体系设置", description = "对应文档 §5.12：课程体系设置")
@RequireRoles({"DIRECTOR", "ADMIN"})
public class CurriculumController {

    @GetMapping
    @Operation(summary = "查询培养方案课程体系")
    public Result<List<Map<String, Object>>> getCurriculum(@PathVariable("schemeId") Long schemeId) {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> item = new HashMap<>();
        item.put("courseId", 1L);
        item.put("courseType", "必修");
        item.put("semester", "第5学期");
        item.put("sortOrder", 1);
        list.add(item);
        return Result.success(list);
    }

    @PutMapping
    @Operation(summary = "保存课程体系排序、类别和学期安排")
    public Result<String> saveCurriculum(@PathVariable("schemeId") Long schemeId, @RequestBody Map<String, Object> body) {
        return Result.success("课程体系保存成功");
    }
}
