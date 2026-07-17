package com.eea.service.student;

import com.eea.vo.StudentCourseScoreVO;
import java.util.List;

/** 学生成绩查询（5.1 小项明细 + 5.2 综合总表） */
public interface StudentScoreService {

    /** 5.2 综合成绩总表 — 所有课程总评 */
    List<StudentCourseScoreVO> listCourseScores(Long studentId);

    /** 5.1 课程小项分文明细 — 某门课的每道题得分 */
    StudentCourseScoreVO getScoreDetail(Long studentId, Long teachingClassId);
}
