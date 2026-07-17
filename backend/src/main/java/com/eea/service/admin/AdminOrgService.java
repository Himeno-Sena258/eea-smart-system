package com.eea.service.admin;

import com.eea.dto.CreateOrgDTO;
import com.eea.vo.OrgNodeVO;
import java.util.List;

public interface AdminOrgService {

    /**
     * 获取全校组织架构树
     */
    List<OrgNodeVO> getOrgTree();

    /**
     * 创建组织机构/专业/班级
     */
    OrgNodeVO createOrg(CreateOrgDTO dto);

    /**
     * 修改组织机构名称
     */
    void updateOrg(Long id, String name);

    /**
     * 删除组织机构节点(防误删校验)
     */
    void deleteOrg(Long id);
}
