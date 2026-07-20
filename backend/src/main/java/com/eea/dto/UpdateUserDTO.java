package com.eea.dto;

import lombok.Data;
import java.util.List;

@Data
public class UpdateUserDTO {
    private String realName;
    private String email;
    private String phone;
    private Integer status;
    private Long orgId;
    private List<String> roleCodes;
    private String studentNo;
    private Long classId;
}
