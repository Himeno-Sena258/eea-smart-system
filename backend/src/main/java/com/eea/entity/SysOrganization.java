package com.eea.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("sys_organization")
@Schema(description = "组织架构信息")
public class SysOrganization {

    @TableId(type = IdType.AUTO)
    @Schema(description = "主键ID")
    private Long id;

    @Schema(description = "机构/部门名称")
    private String name;

    @Schema(description = "父级ID")
    private Long parentId;

    @Schema(description = "类型: COLLEGE-学院, MAJOR-专业, CLASS-班级")
    private String type;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
}