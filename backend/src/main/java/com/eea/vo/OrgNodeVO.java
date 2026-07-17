package com.eea.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "组织架构树节点 VO")
public class OrgNodeVO {

    @Schema(description = "节点ID")
    private Long id;

    @Schema(description = "机构/部门/班级名称")
    private String name;

    @Schema(description = "父级机构ID")
    private Long parentId;

    @Schema(description = "机构级别类型: COLLEGE-学院, MAJOR-专业, CLASS-行政班")
    private String type;

    @Schema(description = "年级(针对行政班)")
    private Integer grade;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "子节点列表")
    private List<OrgNodeVO> children = new ArrayList<>();
}
