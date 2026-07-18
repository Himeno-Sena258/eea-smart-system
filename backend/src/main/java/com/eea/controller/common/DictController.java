package com.eea.controller.common;

import com.eea.common.Result;
import com.eea.entity.SysRole;
import com.eea.mapper.SysRoleMapper;
import com.eea.vo.RoleOptionVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dicts")
@Tag(name = "5.02 角色基础数据", description = "对应文档 §5.2：查询系统角色枚举，用于管理员开户和角色筛选下拉菜单")
public class DictController {

    @Autowired
    private SysRoleMapper sysRoleMapper;

    @GetMapping("/roles")
    @Operation(summary = "查询系统角色枚举", description = "返回 [ { label: '系统管理员', value: 'ADMIN' }, ... ] 结构数据")
    public Result<List<RoleOptionVO>> getRoleOptions() {
        List<SysRole> roles = sysRoleMapper.selectList(null);
        List<RoleOptionVO> list = roles.stream()
                .map(r -> new RoleOptionVO(r.getRoleName(), r.getRoleCode()))
                .collect(Collectors.toList());
        return Result.success(list);
    }

    // ==================== §13.2 其他枚举 ====================

    @GetMapping("/organization-types")
    @Operation(summary = "组织类型枚举")
    public Result<List<RoleOptionVO>> organizationTypes() {
        return Result.success(Arrays.asList(
                vo("学院", "COLLEGE"), vo("专业", "MAJOR"), vo("行政班", "CLASS")
        ));
    }

    @GetMapping("/evidence-level-tags")
    @Operation(summary = "佐证材料等级枚举")
    public Result<List<RoleOptionVO>> evidenceLevelTags() {
        return Result.success(Arrays.asList(
                vo("优秀", "HIGH"), vo("中等", "MEDIUM"), vo("不及格", "LOW")
        ));
    }

    @GetMapping("/survey-types")
    @Operation(summary = "问卷类型枚举")
    public Result<List<RoleOptionVO>> surveyTypes() {
        return Result.success(Arrays.asList(
                vo("学生课程目标达成问卷", "STU_CO"),
                vo("毕业生评价", "GRADUATE"),
                vo("用人单位评价", "EMPLOYER")
        ));
    }

    @GetMapping("/semesters")
    @Operation(summary = "学期选项")
    public Result<List<String>> semesters() {
        return Result.success(Arrays.asList(
                "2024-2025-1", "2024-2025-2", "2025-2026-1",
                "2025-2026-2", "2026-2027-1", "2026-2027-2"
        ));
    }

    @GetMapping("/report-statuses")
    @Operation(summary = "自评报告状态")
    public Result<List<Map<String, Object>>> reportStatuses() {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(mapV(0, "编写中")); list.add(mapV(1, "审核中"));
        list.add(mapV(2, "已完成")); list.add(mapV(3, "已归档"));
        return Result.success(list);
    }

    @GetMapping("/report-section-statuses")
    @Operation(summary = "自评报告章节状态")
    public Result<List<Map<String, Object>>> reportSectionStatuses() {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(mapV(0, "未开始")); list.add(mapV(1, "编写中")); list.add(mapV(2, "已完成"));
        return Result.success(list);
    }

    @GetMapping("/report-data-source-types")
    @Operation(summary = "报告数据源类型")
    public Result<List<RoleOptionVO>> reportDataSourceTypes() {
        return Result.success(Arrays.asList(
                vo("达成度", "ATTAINMENT"), vo("问卷", "SURVEY"),
                vo("数据表格", "TABLE"), vo("图表", "CHART")
        ));
    }

    @GetMapping("/audit-actions")
    @Operation(summary = "审计日志操作类型")
    public Result<List<RoleOptionVO>> auditActions() {
        return Result.success(Arrays.asList(
                vo("登录", "LOGIN"), vo("新增", "CREATE"), vo("修改", "UPDATE"),
                vo("删除", "DELETE"), vo("导出", "EXPORT")
        ));
    }

    private RoleOptionVO vo(String label, String value) {
        return new RoleOptionVO(label, value);
    }

    private Map<String, Object> mapV(int value, String label) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("value", value); m.put("label", label);
        return m;
    }
}
