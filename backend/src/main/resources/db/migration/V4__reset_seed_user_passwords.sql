-- =================================================================================
-- V4: 统一重置初始测试账号的 BCrypt 密码哈希
-- 确保所有测试账号 (admin, prof_wang, dr_li, teacher_zhang, stu_xiaoming) 的初始密码均能匹配 '123456'
-- =================================================================================

UPDATE `sys_user`
SET `password` = '$2a$10$4Hwie7QV0HW5Xo5zCL11HO7.KJpJhLZUj.N.FqMT.TSGkCgZXSTf.'
WHERE `username` IN ('admin', 'prof_wang', 'dr_li', 'teacher_zhang', 'stu_xiaoming');
