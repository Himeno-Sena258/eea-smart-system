package com.eea;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@SpringBootTest
class EeaApplicationTests {

    @Autowired
    private DataSource dataSource;

    @Test
    void contextLoads() {
    }

    @Test
    void testConnection() throws SQLException {
        System.out.println("=========================================");
        System.out.println("====== 开始测试数据库连通性 ======");
        System.out.println("数据源类型：" + dataSource.getClass().getName());
        try (Connection connection = dataSource.getConnection()) {
            System.out.println("数据库连接成功！");
            System.out.println("当前数据库产品名称：" + connection.getMetaData().getDatabaseProductName());
            System.out.println("当前数据库版本：" + connection.getMetaData().getDatabaseProductVersion());
        } catch (SQLException e) {
            System.err.println("数据库连接失败，异常信息：" + e.getMessage());
            throw e;
        }
        System.out.println("====== 数据库连通性测试结束 ======");
        System.out.println("=========================================");
    }
}

