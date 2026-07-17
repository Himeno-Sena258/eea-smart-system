package com.eea.common;

import java.lang.annotation.*;

//    声明这个注解可以贴在什么地方：
//    METHOD-方法上（比如具体的保存接口）
//    TYPE-类/Controller上（代表这整个 Controller 的所有接口都要限制）
@Target({ElementType.METHOD, ElementType.TYPE})

//  声明这个注解能活多久：
@Retention(RetentionPolicy.RUNTIME)

// 用 @interface 关键字来声明这是一个“注解类”
public @interface RequireRoles {

    //接收一个字符串数组，用来填允许访问的角色代码（如 {"ADMIN", "DIRECTOR"}）
    String[] value();
}