package com.eea.controller.director;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eea.common.BusinessException;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.entity.GradRequirement;
import com.eea.mapper.GradRequirementMapper;
import com.eea.service.director.DirectorService;
import com.eea.vo.GradRequirementVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "5.08 毕业要求管理", description = "对应文档 §5.8：毕业要求大项的查询、录入、修改与删除")
@RequireRoles({"DIRECTOR", "ADMIN"})
public class RequirementController {

    @Autowired
    private DirectorService directorService;

    @Autowired
    private GradRequirementMapper gradRequirementMapper;

    @GetMapping("/program-schemes/{schemeId}/requirements")
    @Operation(summary = "查询方案下的毕业要求大项列表")
    public Result<List<GradRequirementVO>> listRequirements(@PathVariable("schemeId") Long schemeId) {
        return Result.success(directorService.listRequirements(schemeId));
    }

    @PostMapping("/program-schemes/{schemeId}/requirements")
    @Operation(summary = "新增毕业要求大项")
    public Result<GradRequirement> createRequirement(@PathVariable("schemeId") Long schemeId, @RequestBody GradRequirement req) {
        req.setSchemeId(schemeId);
        gradRequirementMapper.insert(req);
        return Result.success(req);
    }

    @PutMapping("/requirements/{id}")
    @Operation(summary = "修改毕业要求大项")
    public Result<GradRequirement> updateRequirement(@PathVariable("id") Long id, @RequestBody GradRequirement req) {
        req.setId(id);
        gradRequirementMapper.updateById(req);
        return Result.success(req);
    }

    @DeleteMapping("/requirements/{id}")
    @Operation(summary = "删除毕业要求大项")
    public Result<String> deleteRequirement(@PathVariable("id") Long id) {
        gradRequirementMapper.deleteById(id);
        return Result.success("毕业要求大项删除成功");
    }
}
