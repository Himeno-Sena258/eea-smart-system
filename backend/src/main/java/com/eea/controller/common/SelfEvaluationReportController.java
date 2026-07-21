package com.eea.controller.common;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.*;
import com.eea.entity.*;
import com.eea.mapper.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.*;

/**
 * §12 自评报告模块 — 16 个接口
 */
@RestController
@Tag(name = "12.0 自评报告", description = "自评报告主表、章节、数据源全量管理")
public class SelfEvaluationReportController {

    @Autowired private ReportMapper reportMapper;
    @Autowired private ReportSectionMapper sectionMapper;
    @Autowired private ReportDataSourceMapper dsMapper;
    @Autowired private SysUserMapper sysUserMapper;

    // ===== 报告主表 =====
    @GetMapping("/self-evaluation/reports")
    @RequireRoles({"DIRECTOR", "ADMIN"})
    @Operation(summary = "查询自评报告列表")
    public Result<List<Report>> listReports(@RequestParam(required = false) Long schemeId) {
        QueryWrapper<Report> w = new QueryWrapper<>();
        if (schemeId != null) w.eq("scheme_id", schemeId);
        w.orderByDesc("created_at");
        return Result.success(reportMapper.selectList(w));
    }

    @PostMapping("/self-evaluation/reports")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "创建自评报告")
    public Result<Report> createReport(@RequestBody Report report) {
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        reportMapper.insert(report);
        return Result.success(report);
    }

    @GetMapping("/self-evaluation/reports/{id}")
    @Operation(summary = "获取报告详情")
    public Result<Report> getReport(@PathVariable Long id) {
        return Result.success(reportMapper.selectById(id));
    }

    @PutMapping("/self-evaluation/reports/{id}")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "修改报告基础信息")
    public Result<String> updateReport(@PathVariable Long id, @RequestBody Report report) {
        report.setId(id);
        reportMapper.updateById(report);
        return Result.success("修改成功");
    }

    @PutMapping("/self-evaluation/reports/{id}/status")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "修改报告状态")
    public Result<String> updateReportStatus(@PathVariable Long id, @RequestParam Integer status) {
        Report r = reportMapper.selectById(id);
        if (r == null) throw BusinessException.notFound("报告不存在");
        r.setStatus(status);
        reportMapper.updateById(r);
        return Result.success("状态已更新");
    }

    @DeleteMapping("/self-evaluation/reports/{id}")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "删除报告")
    public Result<String> deleteReport(@PathVariable Long id) {
        reportMapper.deleteById(id);
        return Result.success("删除成功");
    }

    // ===== 报告章节 =====
    @GetMapping("/self-evaluation/reports/{reportId}/sections")
    @Operation(summary = "查询报告章节列表")
    public Result<List<Map<String,Object>>> listSections(@PathVariable Long reportId) {
        QueryWrapper<ReportSection> w = new QueryWrapper<>();
        w.eq("report_id", reportId).orderByAsc("section_code");
        return Result.success(enrichSections(sectionMapper.selectList(w)));
    }

    @PostMapping("/self-evaluation/reports/{reportId}/sections")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "新增报告章节")
    public Result<ReportSection> createSection(@PathVariable Long reportId,
                                                @RequestBody ReportSection section) {
        section.setReportId(reportId);
        sectionMapper.insert(section);
        return Result.success(section);
    }

    @PutMapping("/self-evaluation/sections/{sectionId}")
    @RequireRoles({"DIRECTOR", "INSTRUCTOR"})
    @Operation(summary = "修改章节内容")
    public Result<String> updateSection(@PathVariable Long sectionId,
                                         @RequestBody ReportSection section) {
        section.setId(sectionId);
        sectionMapper.updateById(section);
        return Result.success("修改成功");
    }

    @PutMapping("/self-evaluation/sections/{sectionId}/assign")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "分配章节负责人")
    public Result<String> assignSection(@PathVariable Long sectionId,
                                         @RequestParam Long assignedTo) {
        ReportSection s = sectionMapper.selectById(sectionId);
        if (s == null) throw BusinessException.notFound("章节不存在");
        s.setAssignedTo(assignedTo);
        sectionMapper.updateById(s);
        return Result.success("分配成功");
    }

    @PutMapping("/self-evaluation/sections/{sectionId}/status")
    @RequireRoles({"DIRECTOR", "INSTRUCTOR"})
    @Operation(summary = "修改章节完成状态")
    public Result<String> updateSectionStatus(@PathVariable Long sectionId,
                                               @RequestParam Integer status) {
        ReportSection s = sectionMapper.selectById(sectionId);
        if (s == null) throw BusinessException.notFound("章节不存在");
        s.setStatus(status);
        sectionMapper.updateById(s);
        return Result.success("状态已更新");
    }

    @DeleteMapping("/self-evaluation/sections/{sectionId}")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "删除章节")
    public Result<String> deleteSection(@PathVariable Long sectionId) {
        sectionMapper.deleteById(sectionId);
        return Result.success("删除成功");
    }

    // ===== 数据源 =====
    @GetMapping("/self-evaluation/sections/{sectionId}/data-sources")
    @Operation(summary = "查询章节数据源")
    public Result<List<ReportDataSource>> listDataSources(@PathVariable Long sectionId) {
        QueryWrapper<ReportDataSource> w = new QueryWrapper<>();
        w.eq("section_id", sectionId);
        return Result.success(dsMapper.selectList(w));
    }

    @PutMapping("/self-evaluation/sections/{sectionId}/data-sources")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "保存章节数据源")
    public Result<String> saveDataSources(@PathVariable Long sectionId,
                                           @RequestBody List<ReportDataSource> sources) {
        QueryWrapper<ReportDataSource> w = new QueryWrapper<>();
        w.eq("section_id", sectionId);
        dsMapper.delete(w);
        for (ReportDataSource ds : sources) {
            ds.setSectionId(sectionId);
            dsMapper.insert(ds);
        }
        return Result.success("数据源保存成功");
    }

    // ===== 自动填充与导出 =====
    @PostMapping("/self-evaluation/reports/{id}/auto-fill")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "根据系统数据自动填充报告")
    public Result<Map<String, Object>> autoFill(@PathVariable Long id) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("reportId", id);
        result.put("filledSections", Collections.emptyList());
        result.put("message", "自动填充完成（数据源对接待扩展）");
        return Result.success(result);
    }

    @GetMapping("/self-evaluation/reports/{id}/export")
    @RequireRoles("DIRECTOR")
    @Operation(summary = "导出报告（Word文档）")
    public void exportReport(@PathVariable Long id, HttpServletResponse response) {
        try {
            Report report = reportMapper.selectById(id);
            QueryWrapper<ReportSection> w = new QueryWrapper<>();
            w.eq("report_id", id).orderByAsc("section_code");
            List<ReportSection> sections = sectionMapper.selectList(w);

            XWPFDocument doc = new XWPFDocument();
            XWPFParagraph title = doc.createParagraph();
            title.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun tr = title.createRun(); tr.setBold(true); tr.setFontSize(18);
            tr.setText(report != null ? report.getTitle() : "自评报告");

            for (ReportSection s : sections) {
                XWPFParagraph p = doc.createParagraph();
                XWPFRun r = p.createRun(); r.setBold(true); r.setFontSize(14);
                r.setText(s.getSectionCode() + " " + s.getTitle());
                if (s.getContent() != null) {
                    XWPFParagraph cp = doc.createParagraph();
                    cp.createRun().setText(s.getContent());
                }
            }

            response.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            response.setHeader("Content-Disposition", "attachment; filename=report_" + id + ".docx");
            OutputStream os = response.getOutputStream();
            doc.write(os); os.close(); doc.close();
        } catch (Exception e) {
            throw new RuntimeException("导出失败: " + e.getMessage());
        }
    }

    // ===== P0: 教师"我的章节"入口 =====
    @GetMapping("/self-evaluation/sections/my")
    @Operation(summary = "我的自评报告章节", description = "查询当前登录教师被分配的所有报告章节")
    public Result<List<Map<String,Object>>> mySections() {
        Long userId = UserContext.getUserId();
        QueryWrapper<ReportSection> w = new QueryWrapper<>();
        w.eq("assigned_to", userId).orderByAsc("section_code");
        List<ReportSection> sections = sectionMapper.selectList(w);
        return Result.success(enrichSections(sections));
    }

    private List<Map<String,Object>> enrichSections(List<ReportSection> sections) {
        List<Map<String,Object>> list = new ArrayList<>();
        for (ReportSection s : sections) {
            Report r = reportMapper.selectById(s.getReportId());
            SysUser assignee = s.getAssignedTo() == null ? null : sysUserMapper.selectById(s.getAssignedTo());
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("reportId", s.getReportId());
            m.put("reportTitle", r != null ? r.getTitle() : "");
            m.put("sectionCode", s.getSectionCode());
            m.put("title", s.getTitle());
            m.put("content", s.getContent());
            m.put("status", s.getStatus());
            m.put("assignedTo", s.getAssignedTo());
            m.put("assigneeName", assignee != null ? assignee.getRealName() : "");
            m.put("dueAt", s.getDueAt());
            m.put("submittedAt", s.getSubmittedAt());
            m.put("reviewedBy", s.getReviewedBy());
            m.put("reviewedAt", s.getReviewedAt());
            m.put("reviewComment", s.getReviewComment());
            m.put("updatedAt", s.getUpdatedAt());
            list.add(m);
        }
        return list;
    }
}
