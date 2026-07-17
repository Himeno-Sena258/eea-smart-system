package com.eea.service.student.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.BusinessException;
import com.eea.dto.SubmitSurveyDTO;
import com.eea.entity.SurveyAnswer;
import com.eea.entity.SurveyQuestionnaire;
import com.eea.mapper.SurveyAnswerMapper;
import com.eea.mapper.SurveyQuestionnaireMapper;
import com.eea.service.student.StudentSurveyService;
import com.eea.vo.StudentSurveyVO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentSurveyServiceImpl implements StudentSurveyService {

    @Autowired
    private SurveyQuestionnaireMapper questionnaireMapper;
    @Autowired
    private SurveyAnswerMapper answerMapper;

    private static final ObjectMapper om = new ObjectMapper();

    @Override
    public List<StudentSurveyVO> listSurveys(Long studentId) {
        List<SurveyQuestionnaire> surveys = questionnaireMapper.selectList(null);
        return surveys.stream().map(s -> {
            QueryWrapper<SurveyAnswer> ansW = new QueryWrapper<>();
            ansW.eq("questionnaire_id", s.getId()).eq("user_id", studentId);
            boolean submitted = answerMapper.exists(ansW);
            return new StudentSurveyVO(s.getId(), s.getTitle(), s.getType(),
                    s.getCreatedAt(), submitted);
        }).collect(Collectors.toList());
    }

    @Override
    public StudentSurveyVO getSurveyDetail(Long studentId, Long surveyId) {
        SurveyQuestionnaire survey = questionnaireMapper.selectById(surveyId);
        if (survey == null) throw BusinessException.notFound("问卷不存在");

        QueryWrapper<SurveyAnswer> ansW = new QueryWrapper<>();
        ansW.eq("questionnaire_id", surveyId).eq("user_id", studentId);
        boolean submitted = answerMapper.exists(ansW);

        return new StudentSurveyVO(survey.getId(), survey.getTitle(), survey.getType(),
                survey.getCreatedAt(), submitted);
    }

    @Override
    public void submitSurvey(Long studentId, SubmitSurveyDTO dto) {
        QueryWrapper<SurveyAnswer> ansW = new QueryWrapper<>();
        ansW.eq("questionnaire_id", dto.getQuestionnaireId()).eq("user_id", studentId);
        if (answerMapper.exists(ansW)) {
            throw new BusinessException(80003, "问卷已提交，不能重复提交");
        }

        String json;
        try {
            json = om.writeValueAsString(dto.getAnswers());
        } catch (JsonProcessingException e) {
            throw new BusinessException(80004, "问卷答案格式非法");
        }

        try {
            SurveyAnswer answer = new SurveyAnswer();
            answer.setQuestionnaireId(dto.getQuestionnaireId());
            answer.setUserId(studentId);
            answer.setRawAnswersJson(json);
            answer.setSubmittedAt(LocalDateTime.now());
            answerMapper.insert(answer);
        } catch (Exception e) {
            throw new RuntimeException("问卷提交失败: " + e.getClass().getSimpleName() + " - " + e.getMessage(), e);
        }
    }
}
