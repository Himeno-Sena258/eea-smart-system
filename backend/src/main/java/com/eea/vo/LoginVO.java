package com.eea.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class LoginVO {
    private Long userId;
    private String username;
    private String realName;
    private List<String> roles;
}
