package com.eea.entity;

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
@TableName("teaching_class_student")
@Schema(description = "教学班选课学生关联表")
public class TeachingClassStudent {

    @Schema(description = "教学班ID")
    private Long teachingClassId;

    @Schema(description = "学生ID(sys_user.id)")
    private Long studentId;
}
