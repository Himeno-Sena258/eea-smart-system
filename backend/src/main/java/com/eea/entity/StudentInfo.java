package com.eea.entity;

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
@TableName("student_info")
@Schema(description = "学生拓展信息表")
public class StudentInfo {

    @TableId
    @Schema(description = "关联用户ID")
    private Long userId;

    @Schema(description = "学号")
    private String studentNo;

    @Schema(description = "行政班级ID")
    private Long classId;
}
