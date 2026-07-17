package com.eea.service.student;

import com.eea.vo.StudentAttainmentVO;
import java.util.List;

/** 5.3 个人毕业要求达成 */
public interface StudentAttainmentService {

    /** 查询个人在 30+ 指标点上的达成度 */
    List<StudentAttainmentVO> listAttainment(Long studentId);
}
