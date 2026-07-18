package com.eea.controller.director;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eea.common.BusinessException;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.entity.ProgramScheme;
import com.eea.mapper.ProgramSchemeMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/program-schemes")
@Tag(name = "5.6 人才培养方案版本管理", description = "对应文档 §5.6：人才培养方案版本的查询、新建、修改、发布与归档")
@RequireRoles({"DIRECTOR", "ADMIN"})
public class ProgramSchemeController {

    @Autowired
    private ProgramSchemeMapper programSchemeMapper;

    @GetMapping
    @Operation(summary = "查询培养方案列表")
    public Result<List<ProgramScheme>> listProgramSchemes(@RequestParam(value = "majorId", required = false) Long majorId) {
        LambdaQueryWrapper<ProgramScheme> wrapper = new LambdaQueryWrapper<>();
        if (majorId != null) {
            wrapper.eq(ProgramScheme::getMajorId, majorId);
        }
        wrapper.orderByDesc(ProgramScheme::getId);
        return Result.success(programSchemeMapper.selectList(wrapper));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取培养方案详情")
    public Result<ProgramScheme> getProgramSchemeDetail(@PathVariable("id") Long id) {
        ProgramScheme scheme = programSchemeMapper.selectById(id);
        if (scheme == null) {
            throw new BusinessException(404, "未找到该培养方案");
        }
        return Result.success(scheme);
    }

    @PostMapping
    @Operation(summary = "新增培养方案版本")
    public Result<ProgramScheme> createProgramScheme(@RequestBody ProgramScheme scheme) {
        scheme.setStatus(0); // 默认草稿
        programSchemeMapper.insert(scheme);
        return Result.success(scheme);
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改培养方案")
    public Result<ProgramScheme> updateProgramScheme(@PathVariable("id") Long id, @RequestBody ProgramScheme scheme) {
        scheme.setId(id);
        programSchemeMapper.updateById(scheme);
        return Result.success(scheme);
    }

    @PutMapping("/{id}/publish")
    @Operation(summary = "发布启用培养方案")
    public Result<String> publishProgramScheme(@PathVariable("id") Long id) {
        ProgramScheme scheme = programSchemeMapper.selectById(id);
        if (scheme == null) {
            throw new BusinessException(404, "培养方案不存在");
        }
        scheme.setStatus(1); // 1-发布启用
        programSchemeMapper.updateById(scheme);
        return Result.success("培养方案已成功发布启用");
    }

    @PutMapping("/{id}/archive")
    @Operation(summary = "归档培养方案")
    public Result<String> archiveProgramScheme(@PathVariable("id") Long id) {
        ProgramScheme scheme = programSchemeMapper.selectById(id);
        if (scheme == null) {
            throw new BusinessException(404, "培养方案不存在");
        }
        scheme.setStatus(2); // 2-历史归档
        programSchemeMapper.updateById(scheme);
        return Result.success("培养方案已成功归档");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除草稿方案")
    public Result<String> deleteProgramScheme(@PathVariable("id") Long id) {
        ProgramScheme scheme = programSchemeMapper.selectById(id);
        if (scheme != null && scheme.getStatus() != 0) {
            throw new BusinessException(30002, "只能删除草稿状态的培养方案");
        }
        programSchemeMapper.deleteById(id);
        return Result.success("草稿方案删除成功");
    }
}
