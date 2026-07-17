package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "用户列表分页查询 DTO")
public class UserPageDTO {

    @Schema(description = "页码，从 1 开始", defaultValue = "1")
    private Integer pageNum = 1;

    @Schema(description = "每页数量", defaultValue = "10")
    private Integer pageSize = 10;

    @Schema(description = "搜索关键词(支持账号、真实姓名)")
    private String keyword;

    @Schema(description = "按角色筛选(如 STUDENT, INSTRUCTOR, DIRECTOR)")
    private String roleCode;

    @Schema(description = "按组织架构ID筛选")
    private Long orgId;
}
