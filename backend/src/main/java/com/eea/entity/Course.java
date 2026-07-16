package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("course")
@Schema(description = "课程信息表")
public class Course {

    @TableId(type = IdType.AUTO)
    @Schema(description = "课程ID")
    private Long id;

    @Schema(description = "课程代码")
    private String courseCode;

    @Schema(description = "课程名称")
    private String courseName;

    @Schema(description = "学分")
    private BigDecimal credits;

    @Schema(description = "总学时")
    private Integer hours;

    @Schema(description = "关联培养方案ID")
    private Long schemeId;
}
