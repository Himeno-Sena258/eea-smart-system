package com.eea.entity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
@Data @TableName("survey_question")
public class SurveyQuestion {
    @TableId(type=IdType.AUTO) private Long id;
    private Long questionnaireId;
    private String questionCode;
    private String title;
    private String questionType;
    private String options;
    private Integer sortOrder;
}
