package com.eea.controller.director;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.eea.common.BusinessException;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.entity.GradIndicatorPoint;
import com.eea.mapper.GradIndicatorPointMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "5.09 指标点分解", description = "对应文档 §5.9：毕业要求二级指标点的查询、新增、修改与删除")
@RequireRoles({"DIRECTOR", "ADMIN"})
public class IndicatorController {

    @Autowired
    private GradIndicatorPointMapper gradIndicatorPointMapper;

    @GetMapping("/requirements/{requirementId}/indicators")
    @Operation(summary = "查询某毕业要求下的二级指标点列表")
    public Result<List<GradIndicatorPoint>> listIndicators(@PathVariable("requirementId") Long requirementId) {
        LambdaQueryWrapper<GradIndicatorPoint> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(GradIndicatorPoint::getReqId, requirementId);
        wrapper.orderByAsc(GradIndicatorPoint::getCode);
        return Result.success(gradIndicatorPointMapper.selectList(wrapper));
    }

    @PostMapping("/requirements/{requirementId}/indicators")
    @Operation(summary = "新增二级指标点")
    public Result<GradIndicatorPoint> createIndicator(@PathVariable("requirementId") Long requirementId, @RequestBody GradIndicatorPoint point) {
        point.setReqId(requirementId);
        gradIndicatorPointMapper.insert(point);
        return Result.success(point);
    }

    @PutMapping("/indicators/{id}")
    @Operation(summary = "修改二级指标点")
    public Result<GradIndicatorPoint> updateIndicator(@PathVariable("id") Long id, @RequestBody GradIndicatorPoint point) {
        point.setId(id);
        gradIndicatorPointMapper.updateById(point);
        return Result.success(point);
    }

    @DeleteMapping("/indicators/{id}")
    @Operation(summary = "删除二级指标点")
    public Result<String> deleteIndicator(@PathVariable("id") Long id) {
        gradIndicatorPointMapper.deleteById(id);
        return Result.success("二级指标点删除成功");
    }
}
