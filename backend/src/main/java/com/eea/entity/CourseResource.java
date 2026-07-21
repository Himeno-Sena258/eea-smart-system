package com.eea.entity;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data @TableName("course_resource")
public class CourseResource {
    @TableId(type=IdType.AUTO) private Long id;
    private Long courseId;
    private String resourceType;
    private String description;
    private String fileName;
    private String filePath;
    private String mimeType;
    private Long fileSize;
    private String previewUrl;
    private Long uploadedBy;
    private LocalDateTime uploadedAt;
}
