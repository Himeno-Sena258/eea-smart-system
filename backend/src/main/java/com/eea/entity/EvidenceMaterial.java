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
@TableName("evidence_material")
@Schema(description = "认证佐证材料样本归档表")
public class EvidenceMaterial {

    @TableId(type = IdType.AUTO)
    @Schema(description = "佐证材料ID")
    private Long id;

    @Schema(description = "教学班级ID")
    private Long teachingClassId;

    @Schema(description = "对应的考核模块ID")
    private Long assessmentMethodId;

    @Schema(description = "归档文件名")
    private String fileName;

    @Schema(description = "OSS/本地文件存储路径")
    private String filePath;

    @Schema(description = "样本档次: HIGH-优秀, MEDIUM-中等, LOW-不及格")
    private String levelTag;

    @Schema(description = "上传教师ID")
    private Long uploadedBy;

    @Schema(description = "上传时间")
    private LocalDateTime uploadedAt;
}
