package com.eea.entity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
@Data @TableName("course_teaching_content")
public class CourseTeachingContent {
    @TableId(type=IdType.AUTO) private Long id;
    private Long courseId;
    private String title;
    private Integer hours;
    private String objectiveIds;
    private Integer sortOrder;
}
