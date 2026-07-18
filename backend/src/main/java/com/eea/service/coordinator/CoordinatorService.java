package com.eea.service.coordinator;

import com.eea.dto.*;
import com.eea.vo.*;
import java.util.List;

public interface CoordinatorService {

    /** 3.1 查询课程负责人管辖的课程大纲列表 */
    List<CoordinatorSyllabusVO> listSyllabus(Long coordinatorId);

    /** 3.1 查询单门课程的教学大纲详情 */
    CoordinatorSyllabusVO getSyllabusDetail(Long courseId);

    /** 3.1 保存/修改课程大纲 */
    CoordinatorSyllabusVO saveSyllabus(Long coordinatorId, SaveSyllabusDTO dto);

    /** 3.2 查询课程目标 (CO1~CO5) 列表 */
    List<CourseObjectiveVO> listObjectives(Long courseId);

    /** 3.2 保存/更新课程目标及支撑指标点 */
    CourseObjectiveVO saveObjective(Long coordinatorId, SaveObjectiveDTO dto);

    /** 3.2 删除课程目标 */
    void deleteObjective(Long objectiveId);

    /** 3.3 查询考核环节占比权重列表 */
    List<AssessmentMethodVO> listMethods(Long courseId);

    /** 3.3 批量设置考核环节占比权重（强校验 ΣW = 1.000） */
    void saveMethods(Long coordinatorId, SaveMethodsDTO dto);

    /** 3.4 查询考核细项与 CO 绑定映射表 */
    List<AssessmentItemVO> listItems(Long courseId);

    /** 3.4 新增/更新考核细项与 CO 强绑定 */
    AssessmentItemVO saveItem(Long coordinatorId, SaveItemDTO dto);

    /** 3.4 删除考核细项 */
    void deleteItem(Long itemId);
}
