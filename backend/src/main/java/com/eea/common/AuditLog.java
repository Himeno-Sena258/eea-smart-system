package com.eea.common;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AuditLog {

    /**
     * 操作类型 (如 LOGIN, CREATE, UPDATE, DELETE, EXPORT)
     */
    String action();

    /**
     * 操作对象 (如表名或模块名)
     */
    String target() default "";

    /**
     * 操作简述
     */
    String detail() default "";
}
