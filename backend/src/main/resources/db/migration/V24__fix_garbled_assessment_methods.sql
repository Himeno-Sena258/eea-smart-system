-- V24: 全面修复 V2 编码错误导致的所有乱码

-- ===== 1. 考核方式 1001-1012 =====
UPDATE assessment_method SET name = '期中闭卷考试' WHERE id = 1001;
UPDATE assessment_method SET name = '编程大作业'   WHERE id = 1002;
UPDATE assessment_method SET name = '期末闭卷考试' WHERE id = 1003;
UPDATE assessment_method SET name = '课程项目'     WHERE id = 1004;
UPDATE assessment_method SET name = '期末考试'     WHERE id = 1005;
UPDATE assessment_method SET name = '实验报告'     WHERE id = 1006;
UPDATE assessment_method SET name = '期末项目'     WHERE id = 1007;
UPDATE assessment_method SET name = '课程设计'     WHERE id = 1008;
UPDATE assessment_method SET name = '期末笔试'     WHERE id = 1009;
UPDATE assessment_method SET name = '平时作业'     WHERE id = 1010;
UPDATE assessment_method SET name = '期末大作业'   WHERE id = 1011;
UPDATE assessment_method SET name = '平时实验'     WHERE id = 1012;

-- ===== 2. 考核细项 20001-20030 =====
UPDATE assessment_item SET name = '试卷选择题' WHERE id IN (20001,20004,20007,20010,20013,20016);
UPDATE assessment_item SET name = '试卷简答题' WHERE id IN (20002,20005,20008,20011,20014,20017);
UPDATE assessment_item SET name = '综合题'     WHERE id IN (20003,20006,20009,20012,20015,20018);
UPDATE assessment_item SET name = '项目设计题' WHERE id BETWEEN 20019 AND 20030;

-- ===== 3. 课程目标 2001-2010 =====
UPDATE course_objective SET content = '掌握数据库原理的核心概念和基本原理'     WHERE id = 2001;
UPDATE course_objective SET content = '能够运用数据库原理知识分析SQL查询相关工程问题' WHERE id = 2002;
UPDATE course_objective SET content = '掌握计算机网络的核心概念和基本原理'       WHERE id = 2003;
UPDATE course_objective SET content = '能够运用计算机网络知识分析网络协议相关工程问题' WHERE id = 2004;
UPDATE course_objective SET content = '掌握操作系统的核心概念和基本原理'         WHERE id = 2005;
UPDATE course_objective SET content = '能够运用操作系统知识分析进程管理相关工程问题' WHERE id = 2006;
UPDATE course_objective SET content = '掌握AI基础的核心概念和基本原理'           WHERE id = 2007;
UPDATE course_objective SET content = '能够运用AI基础知识分析机器学习应用相关工程问题' WHERE id = 2008;
UPDATE course_objective SET content = '掌握Web开发的核心概念和基本原理'           WHERE id = 2009;
UPDATE course_objective SET content = '能够运用Web开发知识分析前后端交互相关工程问题' WHERE id = 2010;

-- ===== 4. 持续改进 101-106 =====
UPDATE continuous_improvement SET
  problem_analysis = '数据结构课程中图算法章节得分偏低，需加强算法可视化教学',
  improvement_measures = '增加图算法动画演示环节，布置针对性编程练习，下次教学增加实验课比重'
WHERE id = 101;
UPDATE continuous_improvement SET
  problem_analysis = '数据库课程中SQL优化部分学生掌握不牢固，缺少实际案例练习',
  improvement_measures = '引入真实企业SQL优化案例，增加索引分析和执行计划讲解课时'
WHERE id = 102;
UPDATE continuous_improvement SET
  problem_analysis = '计算机网络实验中协议分析部分学生理解较浅，缺乏实际抓包练习',
  improvement_measures = '增加Wireshark抓包实验课时，配合理论讲解协议交互过程'
WHERE id = 103;
UPDATE continuous_improvement SET
  problem_analysis = '操作系统课程中进程调度部分学生普遍反映困难，需增加专题讲解',
  improvement_measures = '制作进程调度动画演示，增加课后习题讲解，提供扩展阅读材料'
WHERE id = 104;
UPDATE continuous_improvement SET
  problem_analysis = 'AI课程中部分学生对模型的理解不足，缺乏实战训练',
  improvement_measures = '引入Kaggle竞赛数据集进行实战训练，增加模型调参案例教学'
WHERE id = 105;
UPDATE continuous_improvement SET
  problem_analysis = 'Web开发课程中前后端联调部分学生普遍反映困难，缺乏综合实训',
  improvement_measures = '设计完整的全栈项目实训，覆盖从前端请求到后端响应的全流程调试'
WHERE id = 106;

-- ===== 5. 审计日志 101-130 =====
UPDATE sys_audit_log SET detail = '学生登录系统' WHERE id BETWEEN 101 AND 130;

-- ===== 6. 教学班 2001-2002 =====
UPDATE teaching_class SET semester = '2024春', class_name = '数据结构与算法-2024春季02班' WHERE id = 2001;
UPDATE teaching_class SET semester = '2024春', class_name = '数据库系统原理-2024春季02班' WHERE id = 2002;

-- ===== 7. 佐证材料 101-118 =====
UPDATE evidence_material SET file_name = '教学样本1.pdf' WHERE id IN (101,104,107,110,113,116);
UPDATE evidence_material SET file_name = '教学样本2.pdf' WHERE id IN (102,105,108,111,114,117);
UPDATE evidence_material SET file_name = '教学样本3.pdf' WHERE id IN (103,106,109,112,115,118);
