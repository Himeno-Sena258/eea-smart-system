package com.eea.service.director;

import com.eea.dto.*;
import com.eea.vo.*;
import java.util.List;

public interface DirectorService {

    /** 2.1 查询培养方案列表 */
    List<ProgramSchemeVO> listSchemes(Long directorId);

    /** 2.1 创建培养方案 */
    ProgramSchemeVO createScheme(Long directorId, CreateSchemeDTO dto);

    /** 2.1 查询毕业要求大项与指标点拆解列表 */
    List<GradRequirementVO> listRequirements(Long schemeId);

    /** 2.1 新增毕业要求大项与二级指标点 */
    void createRequirement(Long directorId, CreateRequirementDTO dto);

    /** 2.2 获取 OBE 课程矩阵与权重配置表 */
    ObeMatrixVO getObeMatrix(Long schemeId);

    /** 2.2 保存/配置 OBE 矩阵权重（强校验 ΣW = 1.000） */
    void saveObeMatrix(Long directorId, SaveMatrixDTO dto);

    /** 2.2 校验各指标点支撑权重和 ΣW 是否等于 1.000 */
    boolean validateObeMatrix(Long schemeId);

    /** 2.3 执行专业/年级级毕业达成度计算总引擎 Degree(IP_j) = Σ W_{c,j} * A(CO_{c,j}) */
    List<DirectorAttainmentVO> calculateGradAttainment(Long schemeId, Integer grade);

    /** 2.3 查询专业/年级毕业达成度表 */
    List<DirectorAttainmentVO> listGradAttainment(Long schemeId, Integer grade);

    /** 2.4 生成/导出专业认证自评报告 */
    SelfReportVO generateReport(Long directorId, GenerateReportDTO dto);

    /** 2.4 查询专业自评报告列表 */
    List<SelfReportVO> listReports(Long schemeId);
}
