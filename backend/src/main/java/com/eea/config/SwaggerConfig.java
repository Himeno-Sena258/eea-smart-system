package com.eea.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("工程教育专业认证智能服务系统 API 文档")
                        .version("V1.0")
                        .description("基于 OBE 理念与角色权限隔离的后端接口规范 (带 Header: User-Id 认证)"))
                .components(new Components()
                        .addSecuritySchemes("UserIdAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("User-Id")))
                .addSecurityItem(new SecurityRequirement().addList("UserIdAuth"));
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("0-全部接口 (ALL)")
                .pathsToMatch("/**")
                .build();
    }

    @Bean
    public GroupedOpenApi dashboardApi() {
        return GroupedOpenApi.builder()
                .group("1-系统首页概览")
                .pathsToMatch("/dashboard/**")
                .build();
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("2-登录认证模块")
                .pathsToMatch("/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("3-系统管理员 (ADMIN)")
                .pathsToMatch("/admin/**")
                .build();
    }

    @Bean
    public GroupedOpenApi studentApi() {
        return GroupedOpenApi.builder()
                .group("4-学生门户 (STUDENT)")
                .pathsToMatch("/student/**")
                .build();
    }
}
