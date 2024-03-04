<template>
  <div class="head-title-wrapper">
    <h3 class="heading-sub-title">
      {{ t('message.create.step-info.review.title') }}
    </h3>
    <p class="description">
      {{
        t('message.create.step-info.review.description', {
          data: t('common.content.project'),
        })
      }}
    </p>
  </div>

  <div class="basic-info">
    <a-collapse v-model:activeKey="activeKey" expandIconPosition="right">
      <a-collapse-panel key="1" :header="t('common.content.basic-information')">
        <a-card :bordered="false">
          <ul class="list-area">
            <li class="item">
              <strong class="title">{{
                t('common.column.resource-name', {
                  data: t('common.content.project'),
                })
              }}</strong>
              <div class="information">
                <span class="txt">{{
                  nullConverter(props.reviewInfo.basicInfo.name)
                }}</span>
              </div>
            </li>
            <li class="item">
              <strong class="title">{{
                t('common.column.description')
              }}</strong>
              <div class="information">
                <span class="txt">
                  {{ nullConverter(props.reviewInfo.basicInfo.description) }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">{{ t('common.column.enabled') }}</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.basicInfo.enabled ? 'Yes' : 'No' }}
                </span>
              </div>
            </li>
          </ul>
        </a-card>
      </a-collapse-panel>
    </a-collapse>
  </div>

  <div class="basic-info">
    <a-collapse v-model:activeKey="activeKey" expandIconPosition="right">
      <a-collapse-panel key="2" :header="t('common.content.compute')">
        <a-card :bordered="false">
          <ul class="list-area">
            <li class="item">
              <strong class="title">{{ t('common.column.instance') }}</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.computeInstance }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">vCPUs (Core)</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.computeVcpus }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">메모리 (GiB)</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.computeMemory }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">RAM</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.computeRam }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">서버 그룹</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.computeServerGroup }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">서버 그룹 최대 멤버 수</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.computeServerGroupMaxMember }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">키페어</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.computeKeyPair }}
                </span>
              </div>
            </li>
          </ul>
        </a-card>
      </a-collapse-panel>
    </a-collapse>
  </div>

  <div class="basic-info">
    <a-collapse v-model:activeKey="activeKey" expandIconPosition="right">
      <a-collapse-panel key="3" :header="t('common.content.storage')">
        <a-card :bordered="false">
          <ul class="list-area">
            <li class="item">
              <strong class="title">볼륨</strong>
              <div class="information">
                <span class="txt">{{
                  props.reviewInfo.quotaInfo?.storageVolume
                }}</span>
              </div>
            </li>
            <li class="item">
              <strong class="title">볼륨 용량</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.storageVolumeSize }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">볼륨 스냅샷</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.storageVolumeSnapshot }}
                </span>
              </div>
            </li>
          </ul>
        </a-card>
      </a-collapse-panel>
    </a-collapse>
  </div>

  <div class="basic-info">
    <a-collapse v-model:activeKey="activeKey" expandIconPosition="right">
      <a-collapse-panel key="4" :header="t('common.content.network')">
        <a-card :bordered="false">
          <ul class="list-area">
            <li class="item">
              <strong class="title">네트워크</strong>
              <div class="information">
                <span class="txt">{{
                  props.reviewInfo.quotaInfo?.networkNetwork
                }}</span>
              </div>
            </li>
            <li class="item">
              <strong class="title">라우터</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.networkRouter }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">포트</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.networkPort }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">서브넷</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.networkSubnet }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">서브넷 풀</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.networkSubnetPool }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">유동 IP</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.networkFloatingIp }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">보안 그룹</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.networkSecurityGroup }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">보안 그룹 규칙</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.networkSecurityGroupRule }}
                </span>
              </div>
            </li>
          </ul>
        </a-card>
      </a-collapse-panel>
    </a-collapse>
  </div>

  <div class="basic-info">
    <a-collapse v-model:activeKey="activeKey" expandIconPosition="right">
      <a-collapse-panel key="5" :header="t('common.content.share')">
        <a-card :bordered="false">
          <ul class="list-area">
            <li class="item">
              <strong class="title">공유</strong>
              <div class="information">
                <div class="txt list-pre">
                  {{ props.reviewInfo.quotaInfo?.share }}
                </div>
              </div>
            </li>
            <li class="item">
              <strong class="title">공유 용량</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.shareSize }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">공유 스냅샷</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.shareSnapshot }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">공유 스냅샷 용량</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.shareSnapshotSize }}
                </span>
              </div>
            </li>
            <li class="item">
              <strong class="title">공유 네트워크</strong>
              <div class="information">
                <span class="txt">
                  {{ props.reviewInfo.quotaInfo?.shareNetwork }}
                </span>
              </div>
            </li>
          </ul>
        </a-card>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { nullConverter } from '@/utils/Converter.ts';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { ProjectReviewInfoType } from '@/types/identity/project/ProjectCreateType';

const props = defineProps({
  reviewInfo: {
    type: Object as () => ProjectReviewInfoType,
    required: true,
  },
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const activeKey = ref(['1', '2', '3', '4', '5']);
</script>

<style lang="scss" scoped></style>
