package com.eea.common;

import lombok.Getter;

/**
 * 业务异常，携带规范中定义的业务状态码
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    // ===== 常用快捷构造 =====

    /** 20007 用户名或密码错误 */
    public static BusinessException wrongPassword() {
        return new BusinessException(20007, "用户名或密码错误");
    }

    /** 20005 账号已禁用 */
    public static BusinessException accountDisabled() {
        return new BusinessException(20005, "账号已被禁用");
    }

    /** 20001 未登录 */
    public static BusinessException unauthorized() {
        return new BusinessException(20001, "用户未登录");
    }

    /** 20004 无权限 */
    public static BusinessException forbidden() {
        return new BusinessException(20004, "无权限访问");
    }

    /** 50001 数据不存在 */
    public static BusinessException notFound(String msg) {
        return new BusinessException(50001, msg);
    }
}
