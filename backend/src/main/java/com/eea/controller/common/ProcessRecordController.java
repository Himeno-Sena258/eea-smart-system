package com.eea.controller.common;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.entity.ProcessRecord;
import com.eea.mapper.ProcessRecordMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * §7.3 过程性记录
 */
@RestController
@Tag(name = "7.3 过程性记录", description = "出勤、课堂表现等过程数据管理")
public class ProcessRecordController {

    @Autowired private ProcessRecordMapper prMapper;

    @GetMapping("/teaching-classes/{teachingClassId}/process-records")
    @RequireRoles({"INSTRUCTOR", "COORDINATOR"})
    @Operation(summary = "查询过程性记录")
    public Result<List<ProcessRecord>> list(@PathVariable Long teachingClassId) {
        QueryWrapper<ProcessRecord> w = new QueryWrapper<>();
        w.eq("teaching_class_id", teachingClassId);
        return Result.success(prMapper.selectList(w));
    }

    @PostMapping("/teaching-classes/{teachingClassId}/process-records")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "新增过程性记录")
    public Result<ProcessRecord> create(@PathVariable Long teachingClassId,
                                         @RequestBody ProcessRecord record) {
        record.setTeachingClassId(teachingClassId);
        prMapper.insert(record);
        return Result.success(record);
    }

    @PutMapping("/process-records/{id}")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "修改过程性记录")
    public Result<String> update(@PathVariable Long id, @RequestBody ProcessRecord record) {
        record.setId(id);
        prMapper.updateById(record);
        return Result.success("修改成功");
    }

    @DeleteMapping("/process-records/{id}")
    @RequireRoles("INSTRUCTOR")
    @Operation(summary = "删除过程性记录")
    public Result<String> delete(@PathVariable Long id) {
        prMapper.deleteById(id);
        return Result.success("删除成功");
    }
}
