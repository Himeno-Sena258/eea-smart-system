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
@TableName("class_info")
@Schema(description = "行政班级信息表")
public class ClassInfo {

    @TableId(type = IdType.AUTO)
    @Schema(description = "班级ID")
    private Long id;

    @Schema(description = "班级名称")
    private String className;

    @Schema(description = "所属专业ID")
    private Long majorId;

    @Schema(description = "年级(如2024)")
    private Integer grade;
}
