package com.eea.service.student;

import com.eea.dto.SubmitSurveyDTO;
import com.eea.vo.StudentSurveyVO;
import java.util.List;

/** 5.5 间接评价问卷 */
public interface StudentSurveyService {

    /** 问卷列表（含提交状态） */
    List<StudentSurveyVO> listSurveys(Long studentId);

    /** 问卷详情（含题目） */
    StudentSurveyVO getSurveyDetail(Long studentId, Long surveyId);

    /** 提交问卷 */
    void submitSurvey(Long studentId, SubmitSurveyDTO dto);
}
