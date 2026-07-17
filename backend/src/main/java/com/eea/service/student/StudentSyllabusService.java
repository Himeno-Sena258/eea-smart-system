package com.eea.service.student;

import com.eea.vo.StudentSyllabusVO;
import java.util.List;

/** 5.4 课程大纲查阅 */
public interface StudentSyllabusService {

    /** 学生所修课程列表 */
    List<StudentSyllabusVO> listSyllabus(Long studentId);

    /** 单门课程大纲详情 */
    StudentSyllabusVO getSyllabusDetail(Long studentId, Long courseId);
}
