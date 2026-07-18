package com.eea.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//  @Configuration 告诉 Spring，这是一个系统配置文件，启动时必须加载它
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    //  注入我们上面写好的安检员
    @Autowired
    private SecurityInterceptor securityInterceptor;

    //  将拦截器注册到 Spring 的拦截队列中
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(securityInterceptor)
                .addPathPatterns("/**") // 拦截所有请求
                .excludePathPatterns(
                        "/auth/login",              // 放行登录接口
                        "/health",                  // 放行健康检查
                        "/swagger-ui.html",         // 放行 Swagger 网页入口
                        "/swagger-ui/**",           // 放行 Swagger 网页静态资源
                        "/v3/api-docs/**",          // 放行 OpenAPI 接口文档数据
                        "/swagger-resources/**",    // 放行 Swagger 资源
                        "/webjars/**",              // 放行 webjars 资源
                        "/error",                   // 极其重要：放行错误页面，避免 404/500 重定向被误判为 401
                        "/favicon.ico"              // 放行网页图标
                );
    }
}