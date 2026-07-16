package com.eea.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.eea.entity.SysOrganization;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SysOrganizationMapper extends BaseMapper<SysOrganization> {
    // 继承 BaseMapper 后，自动拥有了对 sys_organization 表的增删改查(CRUD)能力！
}