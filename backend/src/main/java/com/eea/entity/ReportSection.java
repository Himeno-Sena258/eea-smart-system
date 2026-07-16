package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("report_section")
@Schema(description = "自评报告章节表")
public class ReportSection {

    @TableId(type = IdType.AUTO)
    @Schema(description = "章节ID")
    private Long id;

    @Schema(description = "所属报告ID")
    private Long reportId;

    @Schema(description = "章节编号(如 1.1, 1.2, 2.1)")
    private String sectionCode;

    @Schema(description = "章节标题")
    private String title;

    @Schema(description = "章节正文内容")
    private String content;

    @Schema(description = "完成状态: 0-未开始, 1-编写中, 2-已完成")
    private Integer status;

    @Schema(description = "负责人ID")
    private Long assignedTo;

    @Schema(description = "最后修改时间")
    private LocalDateTime updatedAt;
}
