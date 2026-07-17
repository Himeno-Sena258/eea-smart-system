package com.eea.common;

import java.util.List;

public class UserContext {

    //    线程 A 存的数据，只有线程 A 能取到；线程 B 存的，只有线程 B 能取到。绝对隔离，线程安全。
    private static final ThreadLocal<Long> userIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<List<String>> rolesHolder = new ThreadLocal<>();

    //    提供静态方法：随时存、取当前用户的 ID
    public static void setUserId(Long userId) { userIdHolder.set(userId); }
    public static Long getUserId() { return userIdHolder.get(); }

    //    提供静态方法：随时存、取当前用户的角色列表
    public static void setRoles(List<String> roles) { rolesHolder.set(roles); }
    public static List<String> getRoles() { return rolesHolder.get(); }

    //    核心卫士：清理方法。
    //    因为 Tomcat 服务器的线程是重复利用的。当一个请求结束后，必须清除数据！
    //    否则下一个请求复用该线程时，就会“偷窥”到上一个用户的残留数据，造成权限混乱或内存泄露。
    public static void clear() {
        userIdHolder.remove();
        rolesHolder.remove();
    }
}