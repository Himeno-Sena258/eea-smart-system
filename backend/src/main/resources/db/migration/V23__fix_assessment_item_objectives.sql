-- 修复考核细项(assessment_item)的course_objective_id指向
-- 之前所有课程102-107的细项都错误指向了id=2016
UPDATE `assessment_item` SET `course_objective_id` = 1021 WHERE `id` = 401;
UPDATE `assessment_item` SET `course_objective_id` = 1021 WHERE `id` = 402;
UPDATE `assessment_item` SET `course_objective_id` = 1022 WHERE `id` = 403;
UPDATE `assessment_item` SET `course_objective_id` = 2001 WHERE `id` = 404;
UPDATE `assessment_item` SET `course_objective_id` = 2001 WHERE `id` = 405;
UPDATE `assessment_item` SET `course_objective_id` = 2002 WHERE `id` = 406;
UPDATE `assessment_item` SET `course_objective_id` = 2003 WHERE `id` = 407;
UPDATE `assessment_item` SET `course_objective_id` = 2003 WHERE `id` = 408;
UPDATE `assessment_item` SET `course_objective_id` = 2004 WHERE `id` = 409;
UPDATE `assessment_item` SET `course_objective_id` = 2005 WHERE `id` = 410;
UPDATE `assessment_item` SET `course_objective_id` = 2005 WHERE `id` = 411;
UPDATE `assessment_item` SET `course_objective_id` = 2006 WHERE `id` = 412;
UPDATE `assessment_item` SET `course_objective_id` = 2007 WHERE `id` = 413;
UPDATE `assessment_item` SET `course_objective_id` = 2007 WHERE `id` = 414;
UPDATE `assessment_item` SET `course_objective_id` = 2008 WHERE `id` = 415;
UPDATE `assessment_item` SET `course_objective_id` = 2009 WHERE `id` = 416;
UPDATE `assessment_item` SET `course_objective_id` = 2009 WHERE `id` = 417;
UPDATE `assessment_item` SET `course_objective_id` = 2010 WHERE `id` = 418;
