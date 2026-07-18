package com.eea.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.eea.common.BusinessException;
import com.eea.common.PageResult;
import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.dto.CreateOrgDTO;
import com.eea.entity.SysOrganization;
import com.eea.mapper.SysOrganizationMapper;
import com.eea.service.admin.AdminOrgService;
import com.eea.vo.OrgNodeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/organizations")
@Tag(name = "5.01 组织架构管理", description = "对应文档 §5.1：学院 -> 专业 -> 行政班级 树状层级维护与增删改查全量 6 个接口")
@RequireRoles("ADMIN")
public class OrganizationController {

    @Autowired
    private AdminOrgService adminOrgService;

    @Autowired
    private SysOrganizationMapper sysOrganizationMapper;

    @GetMapping("/tree")
    @Operation(summary = "1. 查询学院、专业、行政班组织树", description = "返回 学院 -> 专业 -> 行政班级 的树状结构数据")
    public Result<List<OrgNodeVO>> getOrgTree() {
        List<OrgNodeVO> tree = adminOrgService.getOrgTree();
        return Result.success(tree);
    }

    @GetMapping
    @Operation(summary = "2. 分页查询组织", description = "支持按组织类型(COLLEGE, MAJOR, CLASS)筛选")
    public Result<PageResult<SysOrganization>> pageOrganizations(
            @RequestParam(value = "pageNum", defaultValue = "1") Long pageNum,
            @RequestParam(value = "pageSize", defaultValue = "10") Long pageSize,
            @RequestParam(value = "type", required = false) String type) {
        Page<SysOrganization> pageParam = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysOrganization> wrapper = new LambdaQueryWrapper<>();
        if (type != null && !type.trim().isEmpty()) {
            wrapper.eq(SysOrganization::getType, type.trim());
        }
        wrapper.orderByDesc(SysOrganization::getId);
        Page<SysOrganization> page = sysOrganizationMapper.selectPage(pageParam, wrapper);
        return Result.success(PageResult.build(page.getRecords(), page.getCurrent(), page.getSize(), page.getTotal()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "3. 获取组织详情", description = "根据 ID 查询单条组织记录")
    public Result<SysOrganization> getOrganizationDetail(@PathVariable("id") Long id) {
        SysOrganization org = sysOrganizationMapper.selectById(id);
        if (org == null) {
            throw new BusinessException(404, "组织机构不存在");
        }
        return Result.success(org);
    }

    @PostMapping
    @Operation(summary = "4. 新增组织", description = "创建学院/专业/行政班级")
    public Result<OrgNodeVO> createOrganization(@RequestBody CreateOrgDTO dto) {
        OrgNodeVO vo = adminOrgService.createOrg(dto);
        return Result.success(vo);
    }

    @PutMapping("/{id}")
    @Operation(summary = "5. 修改组织", description = "修改组织机构名称")
    public Result<String> updateOrganization(@PathVariable("id") Long id, @RequestParam("name") String name) {
        adminOrgService.updateOrg(id, name);
        return Result.success("修改成功");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "6. 删除组织", description = "删前校验子节点与关联用户，防止破坏层级")
    public Result<String> deleteOrganization(@PathVariable("id") Long id) {
        adminOrgService.deleteOrg(id);
        return Result.success("删除成功");
    }
}
