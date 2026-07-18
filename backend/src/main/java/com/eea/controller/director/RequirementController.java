package com.eea.controller.director;

import com.eea.common.RequireRoles;
import com.eea.common.Result;
import com.eea.entity.GradRequirement;
import com.eea.mapper.GradRequirementMapper;
import com.eea.service.director.DirectorService;
import com.eea.vo.GradRequirementVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "5.08 毕业要求管理", description = "对应文档 §5.8：毕业要求管理")
@RequireRoles({"DIRECTOR", "ADMIN"})
public class RequirementController {

    @Autowired
    private DirectorService directorService;

    @Autowired
    private GradRequirementMapper gradRequirementMapper;

    @GetMapping("/program-schemes/{schemeId}/requirements")
    @Operation(summary = "查询毕业要求")
    public Result<List<GradRequirementVO>> listRequirements(@PathVariable("schemeId") Long schemeId) {
        return Result.success(directorService.listRequirements(schemeId));
    }

    @PostMapping("/program-schemes/{schemeId}/requirements")
    @Operation(summary = "新增毕业要求")
    public Result<GradRequirement> createRequirement(@PathVariable("schemeId") Long schemeId, @RequestBody GradRequirement req) {
        req.setSchemeId(schemeId);
        gradRequirementMapper.insert(req);
        return Result.success(req);
    }

    @PostMapping("/program-schemes/{schemeId}/requirements/init")
    @Operation(summary = "批量初始化 12 条毕业要求")
    public Result<List<GradRequirement>> initRequirements(@PathVariable("schemeId") Long schemeId) {
        String[][] defaultGRs = {
            {"GR1", "工程知识", "能够将数学、自然科学、工程基础和专业知识用于解决复杂工程问题。"},
            {"GR2", "问题分析", "能够应用数学、自然科学和工程科学的基本原理，识别、表达、并通过文献研究分析复杂工程问题，以获得有效结论。"},
            {"GR3", "设计/开发解决方案", "能够设计针对复杂工程问题的解决方案，设计满足特定需求的系统、单元或工艺流程。"},
            {"GR4", "研究", "能够基于科学原理并采用科学方法对复杂工程问题进行研究，包括设计实验、分析与解释数据。"},
            {"GR5", "使用现代工具", "能够针对复杂工程问题，开发、选择与使用恰当的技术、资源、现代工程工具和信息技术工具。"},
            {"GR6", "工程与社会", "能够基于工程相关背景知识进行合理分析，评价专业工程实践和复杂工程问题解决方案对社会的影响。"},
            {"GR7", "环境和可持续发展", "能够理解和评价针对复杂工程问题的工程实践对环境、社会可持续发展的影响。"},
            {"GR8", "职业规范", "具有人文社会科学素养、社会责任感，能够在工程实践中理解并遵守工程职业道德和规范。"},
            {"GR9", "个人和团队", "能够在多学科背景下的团队中承担个体、团队成员以及负责人的角色。"},
            {"GR10", "沟通", "能够就复杂工程问题与业界同行及社会公众进行有效沟通和交流，包括撰写报告和设计文档。"},
            {"GR11", "项目管理", "理解并掌握工程管理原理与经济决策方法，并能在多学科环境中应用。"},
            {"GR12", "终身学习", "具有自主学习和终身学习的意识，有不断学习和适应发展的能力。"}
        };

        List<GradRequirement> resultList = new ArrayList<>();
        for (String[] grData : defaultGRs) {
            GradRequirement req = new GradRequirement();
            req.setSchemeId(schemeId);
            req.setCode(grData[0]);
            req.setTitle(grData[1]);
            req.setContent(grData[2]);
            gradRequirementMapper.insert(req);
            resultList.add(req);
        }
        return Result.success(resultList);
    }

    @PutMapping("/requirements/{id}")
    @Operation(summary = "修改毕业要求")
    public Result<GradRequirement> updateRequirement(@PathVariable("id") Long id, @RequestBody GradRequirement req) {
        req.setId(id);
        gradRequirementMapper.updateById(req);
        return Result.success(req);
    }

    @DeleteMapping("/requirements/{id}")
    @Operation(summary = "删除毕业要求")
    public Result<String> deleteRequirement(@PathVariable("id") Long id) {
        gradRequirementMapper.deleteById(id);
        return Result.success("毕业要求删除成功");
    }
}
