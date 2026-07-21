package com.eea.entity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
@Data @TableName("assessment_standard")
public class AssessmentStandard {
    @TableId(type=IdType.AUTO) private Long id;
    private Long assessmentItemId;
    private String level;
    private BigDecimal minScore;
    private BigDecimal maxScore;
    private String description;
}
