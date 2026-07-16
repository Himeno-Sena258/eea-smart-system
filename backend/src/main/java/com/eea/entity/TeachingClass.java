package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("teaching_class")
@Schema(description = "排课/教学班运行信息表")
public class TeachingClass {

    @TableId(type = IdType.AUTO)
    @Schema(description = "教学班ID")
    private Long id;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "任课教师ID")
    private Long teacherId;

    @Schema(description = "学期(如 2025-2026-1)")
    private String semester;

    @Schema(description = "教学班名称(如 软件工程01班)")
    private String className;
}
