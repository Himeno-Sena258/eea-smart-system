package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Schema(description = "认证样品佐证材料归档 VO")
public class EvidenceSampleVO {
    @Schema(description = "佐证材料ID")
    private Long id;

    @Schema(description = "教学班级ID")
    private Long classId;

    @Schema(description = "教学班名称")
    private String className;

    @Schema(description = "考核模块ID")
    private Long methodId;

    @Schema(description = "考核环节名称 (期末考试, 课程实验, 平时作业)")
    private String methodName;

    @Schema(description = "样品档次: HIGH-优秀, MEDIUM-中等, LOW-不及格")
    private String levelTag;

    @Schema(description = "样品档次中文名称 (优秀 / 中等 / 不及格)")
    private String levelTagDesc;

    @Schema(description = "归档文件名")
    private String fileName;

    @Schema(description = "存储路径/访问 URL")
    private String filePath;

    @Schema(description = "上传人教师ID")
    private Long uploadedBy;

    @Schema(description = "上传人姓名")
    private String uploaderName;

    @Schema(description = "上传时间")
    private LocalDateTime uploadedAt;
}
