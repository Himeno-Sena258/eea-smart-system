package com.eea.common;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * 统一响应格式，与 documents/状态码规范文档.md 对齐
 *
 * 成功：code=0
 * 失败：code=5位业务错误码
 */
@Data
public class Result<T> {

    private int code;
    private String message;
    private T data;
    private String traceId;
    private String timestamp;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Result(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.traceId = UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        this.timestamp = LocalDateTime.now().format(FMT);
    }

    /** 成功 */
    public static <T> Result<T> success(T data) {
        return new Result<>(0, "success", data);
    }

    /** 成功（无数据） */
    public static <T> Result<T> success() {
        return new Result<>(0, "success", null);
    }

    /** 失败 */
    public static <T> Result<T> error(int code, String message) {
        return new Result<>(code, message, null);
    }

    /** 失败（带详细错误数据） */
    public static <T> Result<T> error(int code, String message, T data) {
        return new Result<>(code, message, data);
    }
}
