package com.eea.common.config;

import com.eea.common.AuditLog;
import com.eea.common.UserContext;
import com.eea.entity.SysAuditLog;
import com.eea.mapper.SysAuditLogMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Aspect
@Component
public class AuditLogAspect {

    @Autowired
    private SysAuditLogMapper sysAuditLogMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Around("@annotation(auditLog)")
    public Object around(ProceedingJoinPoint joinPoint, AuditLog auditLog) throws Throwable {
        Object result = joinPoint.proceed();

        try {
            // 提取客户端 IP
            String ipAddress = "127.0.0.1";
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                ipAddress = request.getRemoteAddr();
            }

            Long userId = UserContext.getUserId();
            String action = auditLog.action();
            String target = auditLog.target();
            String detail = auditLog.detail();

            // 如果有方法入参，序列化为 JSON 字符串
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0) {
                try {
                    String paramJson = objectMapper.writeValueAsString(args[0]);
                    detail = detail + " [Params: " + paramJson + "]";
                } catch (Exception ignored) {
                }
            }

            SysAuditLog logEntity = SysAuditLog.builder()
                    .userId(userId)
                    .username(userId != null ? "User-" + userId : "Anonymous")
                    .action(action)
                    .target(target)
                    .detail(detail)
                    .ipAddress(ipAddress)
                    .build();

            sysAuditLogMapper.insert(logEntity);
        } catch (Exception e) {
            log.error("审计日志异步记录异常", e);
        }

        return result;
    }
}
