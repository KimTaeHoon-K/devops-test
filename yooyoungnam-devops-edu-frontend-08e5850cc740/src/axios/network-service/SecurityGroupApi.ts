import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import {
  InstanceDetailSecurityGroupListType,
  SecurityGroupType,
} from '@/types/network/security-group/SecurityGroupListType';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { SecurityGroupCreateType } from '@/types/network/security-group/SecurityGroupCreateType';
import { SecurityGroupDeleteType } from '@/types/network/security-group/SecurityGroupDeleteType';
import { SecurityGroupUpdateType } from '@/types/network/security-group/SecurityGroupUpdateType';
import { SecurityGroupRuleType } from '@/types/network/security-group/security-group-rule/SecurityGroupRuleListType';
import { SecurityGroupRuleCreateType } from '@/types/network/security-group/security-group-rule/SecurityGroupRuleCreateType';
import { SecurityGroupRuleDeleteType } from '@/types/network/security-group/security-group-rule/SecurityGroupRuleDeleteType';

// prefix
const NETWORK_SECURITY_GROUP_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/network/security-groups`;
const NETWORK_SECURITY_GROUP_RULE_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/network/security-group-rules`;

// 보안 그룹 목록 조회 api
export async function getSecurityGroupList(
  page: number,
  pageSize: number,
  projectId?: string
): Promise<AxiosResponse<ResponseType<SecurityGroupType[]>>> {
  let url = `${NETWORK_SECURITY_GROUP_PREFIX}`;
  if (projectId) {
    url = `${NETWORK_SECURITY_GROUP_PREFIX}/instance`;
  }
  return instance.get(url, {
    params: { size: pageSize, page: page, projectId: projectId },
  });
}

// 인스턴스 상세용 보안 그룹 목록 조회 api
export async function getInstanceDetailSecurityGroupList(
  securityGroupId: string,
  type: string
): Promise<AxiosResponse<ResponseType<InstanceDetailSecurityGroupListType>>> {
  return instance.get(
    `${NETWORK_SECURITY_GROUP_PREFIX}/${securityGroupId}/instance`,
    {
      params: { type: type },
    }
  );
}

// 보안 그룹 상세 조회 api
export async function getSecurityGroupDetail(
  securityGroupId: string
): Promise<AxiosResponse<ResponseType<SecurityGroupType>>> {
  return instance.get(`${NETWORK_SECURITY_GROUP_PREFIX}/${securityGroupId}`);
}

// 보안 그룹 생성 api
export async function createSecurityGroup(
  securityGroup: SecurityGroupCreateType
): Promise<AxiosResponse<ResponseType<NetworkType>>> {
  return instance.post(
    `${NETWORK_SECURITY_GROUP_PREFIX}`,
    {
      securityGroup: securityGroup,
    },
    { params: { ownerProjectId: securityGroup.projectId } }
  );
}

// 보안 그룹 수정 api
export async function updateSecurityGroup(
  securityGroupId: string,
  securityGroupUpdateType: SecurityGroupUpdateType
): Promise<AxiosResponse<ResponseType<NetworkType>>> {
  return instance.put(`${NETWORK_SECURITY_GROUP_PREFIX}/${securityGroupId}`, {
    securityGroup: securityGroupUpdateType.securityGroup,
  });
}

// 보안 그룹 삭제 api
export async function deleteSecurityGroup(
  securityDeleteType: SecurityGroupDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_SECURITY_GROUP_PREFIX}`, {
    data: securityDeleteType,
  });
}

// 보안 규칙 목록 조회 api
export async function getSecurityGroupRuleList(
  page: number,
  pageSize: number,
  securityGroupId?: string
): Promise<AxiosResponse<ResponseType<SecurityGroupRuleType[]>>> {
  return instance.get(`${NETWORK_SECURITY_GROUP_RULE_PREFIX}`, {
    params: { size: pageSize, page: page, securityGroupId: securityGroupId },
  });
}
// 보안 규칙 생성 api
export async function createSecurityGroupRule(
  securityGroupRule: SecurityGroupRuleCreateType
): Promise<AxiosResponse<ResponseType<SecurityGroupRuleType>>> {
  return instance.post(`${NETWORK_SECURITY_GROUP_RULE_PREFIX}`, {
    securityGroupRule: securityGroupRule,
  });
}

// 보안 규칙 삭제 api
export async function deleteSecurityGroupRule(
  securityGroupRuleDeleteType: SecurityGroupRuleDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_SECURITY_GROUP_RULE_PREFIX}`, {
    data: securityGroupRuleDeleteType,
  });
}
