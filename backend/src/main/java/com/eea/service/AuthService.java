package com.eea.service;

import com.eea.dto.LoginRequest;
import com.eea.vo.LoginVO;

public interface AuthService {
    LoginVO login(LoginRequest request);
}
