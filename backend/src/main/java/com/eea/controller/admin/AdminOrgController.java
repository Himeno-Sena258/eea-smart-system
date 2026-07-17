package com.eea.controller.admin;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.dto.CreateOrgDTO;
import com.eea.service.admin.AdminOrgService;
import com.eea.vo.OrgNodeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/organizations")
@Tag(name = "管理员-组织架构管理", description = "学院 -> 专业 -> 行政班级 树状层级维护与防误删校验")
@RequireRoles("ADMIN")
public class AdminOrgController {

    @Autowired
    private AdminOrgService adminOrgService;

    @GetMapping("/tree")
    @Operation(summary = "获取全校组织架构树", description = "返回 学院 -> 专业 -> 行政班级 的树状结构数据")
    public Result<List<OrgNodeVO>> getOrgTree() {
        List<OrgNodeVO> tree = adminOrgService.getOrgTree();
        return Result.success(tree);
    }

    @PostMapping
    @Operation(summary = "创建组织机构 / 专业 / 行政班")
    public Result<OrgNodeVO> createOrg(@RequestBody CreateOrgDTO dto) {
        OrgNodeVO vo = adminOrgService.createOrg(dto);
        return Result.success(vo);
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改组织机构名称")
    public Result<String> updateOrg(@PathVariable("id") Long id, @RequestParam("name") String name) {
        adminOrgService.updateOrg(id, name);
        return Result.success("修改成功");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除组织机构", description = "删前校验子节点与关联用户，防止破坏层级")
    public Result<String> deleteOrg(@PathVariable("id") Long id) {
        adminOrgService.deleteOrg(id);
        return Result.success("删除成功");
    }
}
