package com.eea.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
@Schema(description = "新增毕业要求大项与二级指标点 DTO")
public class CreateRequirementDTO {

    @Schema(description = "培养方案ID", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long schemeId;

    @Schema(description = "毕业要求代码 (如 1, 2, 3)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String reqCode;

    @Schema(description = "毕业要求大项标题 (如 工程知识)", requiredMode = Schema.RequiredMode.REQUIRED)
    private String title;

    @Schema(description = "毕业要求内涵详细描述", requiredMode = Schema.RequiredMode.REQUIRED)
    private String content;

    @Schema(description = "拆解的二级指标点列表")
    private List<CreateIndicatorPointItem> indicatorPoints;

    @Data
    @Schema(description = "二级指标点条目")
    public static class CreateIndicatorPointItem {
        @Schema(description = "指标点代码 (如 1.1, 1.2)", requiredMode = Schema.RequiredMode.REQUIRED)
        private String code;

        @Schema(description = "指标点拆解描述", requiredMode = Schema.RequiredMode.REQUIRED)
        private String content;
    }
}
