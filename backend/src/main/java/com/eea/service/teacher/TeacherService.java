package com.eea.service.teacher;

import com.eea.dto.BatchScoreInputDTO;
import com.eea.dto.SaveImprovementDTO;
import com.eea.dto.UploadSampleDTO;
import com.eea.vo.*;
import java.util.List;

public interface TeacherService {

    /** 4.1 查询当前教师主讲的教学班列表 */
    List<TeacherClassVO> listTeacherClasses(Long teacherId);

    /** 4.1 查询教学班花名册 */
    List<TeacherClassStudentVO> listClassStudents(Long teacherId, Long classId);

    /** 4.2 获取细项成绩网格表 */
    TeacherScoreGridVO getScoreGrid(Long teacherId, Long classId);

    /** 4.2 批量保存细项得分 (防超满分校验) */
    void batchSaveScores(Long teacherId, Long classId, BatchScoreInputDTO dto);

    /** 4.3 班级总评成绩单表 (自动计算总评并存入 student_course_score) */
    List<TeacherFinalScoreVO> calculateAndListFinalScores(Long teacherId, Long classId);

    /** 4.4 班级 CO 达成度一键计算引擎 A(COk) */
    List<TeacherCoAttainmentVO> calculateCoAttainment(Long teacherId, Long classId);

    /** 4.4 查询班级 CO 达成度表 */
    List<TeacherCoAttainmentVO> listCoAttainment(Long teacherId, Long classId);

    /** 4.5 保存/提交班级教学改进反思 */
    void saveImprovement(Long teacherId, Long classId, SaveImprovementDTO dto);

    /** 4.5 查询班级教学改进反思列表 */
    List<TeachingImprovementVO> listImprovements(Long teacherId, Long classId);

    /** 4.6 上传/提交认证归档样品 */
    void uploadSample(Long teacherId, Long classId, UploadSampleDTO dto);

    /** 4.6 查询认证样品归档列表 */
    List<EvidenceSampleVO> listSamples(Long teacherId, Long classId);
}
