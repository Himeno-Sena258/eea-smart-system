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
@TableName("course_objective")
@Schema(description = "课程目标表(1门课通常有3-5个课程目标)")
public class CourseObjective {

    @TableId(type = IdType.AUTO)
    @Schema(description = "课程目标ID")
    private Long id;

    @Schema(description = "课程ID")
    private Long courseId;

    @Schema(description = "课程目标编码(如 CO1, CO2)")
    private String objectiveCode;

    @Schema(description = "课程目标描述(可衡量动词表达)")
    private String content;
}
