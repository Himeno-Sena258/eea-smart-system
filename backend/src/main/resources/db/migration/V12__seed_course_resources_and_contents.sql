-- Seed course resources and teaching content for the course quality page.
-- These records are used by /courses/{courseId}/resources and
-- /courses/{courseId}/teaching-contents.

INSERT INTO `course_resource`
(`id`, `course_id`, `resource_type`, `description`, `file_name`, `file_path`, `mime_type`, `file_size`, `preview_url`, `uploaded_by`, `uploaded_at`) VALUES
(14001, 1, 'SYLLABUS', '2025-2026 学年软件工程课程大纲', '软件工程课程大纲.pdf', '/course/1/syllabus.pdf', 'application/pdf', 1121114, NULL, 103, '2026-01-01 00:00:00'),
(14002, 1, 'PPT', '软件工程课堂讲义合集', '软件工程课堂讲义.zip', '/course/1/slides.zip', 'application/zip', 456781, NULL, 103, '2026-01-01 00:00:00'),
(14003, 1, 'CASE', '需求分析与系统设计案例', '软件工程案例库.zip', '/course/1/cases.zip', 'application/zip', 806564, NULL, 103, '2026-01-01 00:00:00'),
(14101, 101, 'SYLLABUS', '软件工程课程大纲', 'SE-302 软件工程课程大纲.pdf', '/course/101/syllabus.pdf', 'application/pdf', 1121114, NULL, 1031, '2026-01-01 00:00:00'),
(14102, 101, 'PPT', '软件工程课堂课件', 'SE-302 课堂课件.zip', '/course/101/slides.zip', 'application/zip', 456781, NULL, 1031, '2026-01-01 00:00:00'),
(14103, 101, 'CASE', '需求建模与测试案例', 'SE-302 案例材料.zip', '/course/101/cases.zip', 'application/zip', 806564, NULL, 1032, '2026-01-01 00:00:00'),
(14104, 101, 'REFERENCE', '软件工程参考资料', 'SE-302 参考文献清单.pdf', '/course/101/reference.pdf', 'application/pdf', 1953707, NULL, 1011, '2026-01-01 00:00:00'),
(14105, 102, 'SYLLABUS', '数据结构与算法课程大纲', 'CS-201 数据结构与算法课程大纲.pdf', '/course/102/syllabus.pdf', 'application/pdf', 1616478, NULL, 1032, '2026-01-01 00:00:00'),
(14106, 102, 'PPT', '数据结构与算法课件', 'CS-201 课堂课件.zip', '/course/102/slides.zip', 'application/zip', 912972, NULL, 1031, '2026-01-01 00:00:00'),
(14107, 103, 'SYLLABUS', '数据库系统原理课程大纲', 'CS-301 数据库系统原理课程大纲.pdf', '/course/103/syllabus.pdf', 'application/pdf', 1843999, NULL, 1031, '2026-01-01 00:00:00'),
(14108, 104, 'SYLLABUS', '计算机网络课程大纲', 'CS-304 计算机网络课程大纲.pdf', '/course/104/syllabus.pdf', 'application/pdf', 1439662, NULL, 1031, '2026-01-01 00:00:00'),
(14109, 105, 'SYLLABUS', '操作系统设计课程大纲', 'CS-303 操作系统设计课程大纲.pdf', '/course/105/syllabus.pdf', 'application/pdf', 1224870, NULL, 1032, '2026-01-01 00:00:00'),
(14110, 106, 'SYLLABUS', 'Python 与人工智能基础课程大纲', 'AI-101 Python 与人工智能基础课程大纲.pdf', '/course/106/syllabus.pdf', 'application/pdf', 505121, NULL, 1011, '2026-01-01 00:00:00'),
(14111, 107, 'SYLLABUS', 'Web 全栈开发技术课程大纲', 'SE-401 Web 全栈开发技术课程大纲.pdf', '/course/107/syllabus.pdf', 'application/pdf', 100745, NULL, 1011, '2026-01-01 00:00:00'),
(14112, 107, 'CASE', '全栈项目综合案例', 'SE-401 项目案例.zip', '/course/107/cases.zip', 'application/zip', 1170219, NULL, 1031, '2026-01-01 00:00:00')
ON DUPLICATE KEY UPDATE
    `course_id` = VALUES(`course_id`),
    `resource_type` = VALUES(`resource_type`),
    `description` = VALUES(`description`),
    `file_name` = VALUES(`file_name`),
    `file_path` = VALUES(`file_path`),
    `mime_type` = VALUES(`mime_type`),
    `file_size` = VALUES(`file_size`),
    `preview_url` = VALUES(`preview_url`),
    `uploaded_by` = VALUES(`uploaded_by`),
    `uploaded_at` = VALUES(`uploaded_at`);

INSERT INTO `course_teaching_content`
(`id`, `course_id`, `title`, `hours`, `objective_ids`, `sort_order`) VALUES
(14201, 1, '软件过程模型与项目管理', 8, '[1]', 1),
(14202, 1, '需求分析与 UML 建模', 12, '[2]', 2),
(14203, 1, '体系结构设计与详细设计', 14, '[3]', 3),
(14204, 1, '软件测试与质量保证', 10, '[3]', 4),
(14205, 1, '综合项目实践', 20, '[1,2,3]', 5),
(14301, 101, '软件过程模型与项目管理', 8, '[1011]', 1),
(14302, 101, '需求分析与 UML 建模', 12, '[1012]', 2),
(14303, 101, '体系结构设计与详细设计', 14, '[1012,1013]', 3),
(14304, 101, '软件测试与质量保证', 10, '[1013]', 4),
(14305, 101, '综合项目实践', 20, '[1011,1012,1013]', 5),
(14306, 102, '线性结构', 12, '[1021]', 1),
(14307, 102, '树、图与查找结构', 18, '[1021,1022]', 2),
(14308, 102, '排序与算法复杂度分析', 16, '[1022]', 3),
(14309, 102, '算法设计综合实践', 26, '[1021,1022]', 4),
(14310, 103, '关系模型与关系代数', 10, '[2001]', 1),
(14311, 103, 'SQL 查询与优化', 16, '[2002]', 2),
(14312, 103, '数据库设计与事务管理', 30, '[2001,2002]', 3),
(14313, 104, '网络体系结构与 TCP/IP', 18, '[2003]', 1),
(14314, 104, '路由、传输与网络安全', 18, '[2003,2004]', 2),
(14315, 104, '网络实验与性能分析', 20, '[2004]', 3),
(14316, 105, '进程管理与并发控制', 18, '[2005]', 1),
(14317, 105, '内存、文件与 I/O 管理', 22, '[2005,2006]', 2),
(14318, 105, '系统性能分析实践', 24, '[2006]', 3),
(14319, 106, 'Python 程序设计基础', 18, '[2007]', 1),
(14320, 106, '数据处理与机器学习入门', 18, '[2007,2008]', 2),
(14321, 106, '智能应用小项目', 12, '[2008]', 3),
(14322, 107, 'HTML、CSS 与 JavaScript 基础', 14, '[2009]', 1),
(14323, 107, '前端框架与接口协作', 16, '[2009,2010]', 2),
(14324, 107, '后端接口与数据库访问', 14, '[2010]', 3),
(14325, 107, '全栈项目部署与持续集成', 12, '[2009,2010]', 4)
ON DUPLICATE KEY UPDATE
    `course_id` = VALUES(`course_id`),
    `title` = VALUES(`title`),
    `hours` = VALUES(`hours`),
    `objective_ids` = VALUES(`objective_ids`),
    `sort_order` = VALUES(`sort_order`);
