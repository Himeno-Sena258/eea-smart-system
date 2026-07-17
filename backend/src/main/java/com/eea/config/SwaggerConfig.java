package com.eea.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EEA 智能服务系统 API")
                        .version("0.0.1")
                        .description("工程教育专业认证智能服务系统 - 后端接口"))
                // 1. 配置全局参数组件，让 Swagger 知道我们需要在请求头里带上 User-Id
                .components(new Components()
                        .addSecuritySchemes("UserIdAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER) // 放在 Header 中
                                .name("User-Id")))            // 请求头的名字
                // 2. 将这个安全配置应用到所有的接口中
                .addSecurityItem(new SecurityRequirement().addList("UserIdAuth"));
    }
}

