package com.eea.service.admin.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.eea.common.BusinessException;
import com.eea.dto.CreateOrgDTO;
import com.eea.entity.ClassInfo;
import com.eea.entity.SysOrganization;
import com.eea.entity.SysUser;
import com.eea.mapper.ClassInfoMapper;
import com.eea.mapper.SysOrganizationMapper;
import com.eea.mapper.SysUserMapper;
import com.eea.service.admin.AdminOrgService;
import com.eea.vo.OrgNodeVO;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminOrgServiceImpl implements AdminOrgService {

    @Autowired
    private SysOrganizationMapper sysOrganizationMapper;

    @Autowired
    private ClassInfoMapper classInfoMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Override
    public List<OrgNodeVO> getOrgTree() {
        List<SysOrganization> allOrgs = sysOrganizationMapper.selectList(null);
        if (allOrgs == null || allOrgs.isEmpty()) {
            return new ArrayList<>();
        }

        // 查询所有行政班级的年级信息
        List<ClassInfo> classInfos = classInfoMapper.selectList(null);
        Map<String, Integer> classGradeMap = new HashMap<>();
        if (classInfos != null) {
            for (ClassInfo ci : classInfos) {
                classGradeMap.put(ci.getClassName(), ci.getGrade());
            }
        }

        // 转化为 VO Map
        Map<Long, OrgNodeVO> nodeMap = new HashMap<>();
        for (SysOrganization org : allOrgs) {
            Integer grade = classGradeMap.get(org.getName());
            OrgNodeVO vo = OrgNodeVO.builder()
                    .id(org.getId())
                    .name(org.getName())
                    .parentId(org.getParentId())
                    .type(org.getType())
                    .grade(grade)
                    .createdAt(org.getCreatedAt())
                    .children(new ArrayList<>())
                    .build();
            nodeMap.put(org.getId(), vo);
        }

        // 组装树
        List<OrgNodeVO> rootNodes = new ArrayList<>();
        for (OrgNodeVO node : nodeMap.values()) {
            if (node.getParentId() == null || node.getParentId() == 0) {
                rootNodes.add(node);
            } else {
                OrgNodeVO parentNode = nodeMap.get(node.getParentId());
                if (parentNode != null) {
                    parentNode.getChildren().add(node);
                } else {
                    rootNodes.add(node);
                }
            }
        }

        return rootNodes;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrgNodeVO createOrg(CreateOrgDTO dto) {
        // 1. 同级名称去重
        QueryWrapper<SysOrganization> checkWrapper = new QueryWrapper<>();
        checkWrapper.eq("name", dto.getName());
        if (dto.getParentId() != null) {
            checkWrapper.eq("parent_id", dto.getParentId());
        } else {
            checkWrapper.isNull("parent_id");
        }
        if (sysOrganizationMapper.selectCount(checkWrapper) > 0) {
            throw new BusinessException(40012, "同级组织机构名称重复");
        }

        // 2. 写入 sys_organization
        SysOrganization org = new SysOrganization();
        org.setName(dto.getName());
        org.setParentId(dto.getParentId());
        org.setType(dto.getType());
        sysOrganizationMapper.insert(org);

        // 3. 如果类型是 CLASS，同时同步创建 class_info 记录
        if ("CLASS".equalsIgnoreCase(dto.getType())) {
            if (dto.getParentId() == null || dto.getGrade() == null) {
                throw new BusinessException(30002, "缺少必填参数: 行政班级必须指定所属专业和年级");
            }
            ClassInfo classInfo = new ClassInfo();
            classInfo.setClassName(dto.getName());
            classInfo.setMajorId(dto.getParentId());
            classInfo.setGrade(dto.getGrade());
            classInfoMapper.insert(classInfo);
        }

        return OrgNodeVO.builder()
                .id(org.getId())
                .name(org.getName())
                .parentId(org.getParentId())
                .type(org.getType())
                .grade(dto.getGrade())
                .createdAt(org.getCreatedAt())
                .children(new ArrayList<>())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateOrg(Long id, String name) {
        SysOrganization org = sysOrganizationMapper.selectById(id);
        if (org == null) {
            throw new BusinessException(40011, "组织机构不存在");
        }
        org.setName(name);
        sysOrganizationMapper.updateById(org);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteOrg(Long id) {
        SysOrganization org = sysOrganizationMapper.selectById(id);
        if (org == null) {
            throw new BusinessException(40011, "组织机构不存在");
        }

        // 防误删 1：是否有子机构
        QueryWrapper<SysOrganization> childWrapper = new QueryWrapper<>();
        childWrapper.eq("parent_id", id);
        if (sysOrganizationMapper.selectCount(childWrapper) > 0) {
            throw new BusinessException(40013, "组织下存在子节点，无法删除");
        }

        // 防误删 2：是否有绑定用户
        QueryWrapper<SysUser> userWrapper = new QueryWrapper<>();
        userWrapper.eq("org_id", id);
        if (sysUserMapper.selectCount(userWrapper) > 0) {
            throw new BusinessException(50004, "该组织机构下关联有用户数据，无法删除");
        }

        sysOrganizationMapper.deleteById(id);
    }
}
