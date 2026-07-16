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
@TableName("student_score")
@Schema(description = "学生得分明细表(成绩与达成度计算引擎数据源)")
public class StudentScore {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "学生用户ID(sys_user.id)")
    private Long studentId;

    @Schema(description = "考核细项ID")
    private Long assessmentItemId;

    @Schema(description = "实际得分")
    private BigDecimal actualScore;
}
