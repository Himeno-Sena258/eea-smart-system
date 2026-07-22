package com.eea.common;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "统一分页响应结构")
public class PageResult<T> {

    @Schema(description = "数据记录列表")
    private List<T> records;

    @Schema(description = "当前页码")
    private Long pageNum;

    @Schema(description = "每页数量")
    private Long pageSize;

    @Schema(description = "总记录数")
    private Long total;

    @Schema(description = "总页数")
    private Long pages;

    @Schema(description = "启用账号数(仅用户管理场景)")
    private Long activeCount;

    public static <T> PageResult<T> build(List<T> records, long pageNum, long pageSize, long total) {
        long pages = (total + pageSize - 1) / pageSize;
        return new PageResult<>(records, pageNum, pageSize, total, pages, null);
    }
}
