<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.project.quota-setting.title') }}
      </h3>
      <p class="description">
        {{ t('message.create.step-info.project.quota-setting.description') }}
      </p>
    </div>

    <!-- 컴퓨트 -->
    <a-row class="form-row" :gutter="12">
      <div class="ant-form-item-label">
        <label for="basic_project">
          {{ t('common.content.compute') }}
        </label>
      </div>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project">
            {{ t('common.content.instance') }}
          </label>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.computeInstance"
            :min="0"
            :max="20"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.computeInstance"
          v-slot="{ handleChange, errorMessage }"
          name="computeInstance"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.computeInstance"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> vCPUs (Core) </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> 메모리 (GiB) </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> RAM </label>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.computeVcpus"
            :min="0"
            :max="20"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.computeVcpus"
          v-slot="{ handleChange, errorMessage }"
          name="computeVcpus"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.computeVcpus"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.computeMemory"
            :min="0"
            :max="20"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.computeMemory"
          v-slot="{ handleChange, errorMessage }"
          name="computeMemory"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.computeMemory"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.computeRam"
            :min="0"
            :max="20"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.computeRam"
          v-slot="{ handleChange, errorMessage }"
          name="computeRam"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.computeRam"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project">{{ '서버 그룹' }} </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project">
            {{ '서버 그룹 최대 멤버 수' }}
          </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project">
            {{ t('common.content.key-pair') }}
          </label>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.computeServerGroup"
            :min="0"
            :max="20"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.computeServerGroup"
          v-slot="{ handleChange, errorMessage }"
          name="computeServerGroup"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.computeServerGroup"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.computeServerGroupMaxMember"
            :min="0"
            :max="20"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.computeServerGroupMaxMember"
          v-slot="{ handleChange, errorMessage }"
          name="computeServerGroupMaxMember"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.computeServerGroupMaxMember"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.computeKeyPair"
            :min="0"
            :max="20"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.computeKeyPair"
          v-slot="{ handleChange, errorMessage }"
          name="computeKeyPair"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.computeKeyPair"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>

    <!-- 스토리지 -->
    <a-row class="form-row" :gutter="12">
      <div class="ant-form-item-label">
        <label for="basic_project">
          {{ t('common.content.storage') }}
        </label>
      </div>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> {{ t('common.content.volume') }} </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> 볼륨 용량 (GiB) </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project">
            {{ t('common.content.volume-snapshot') }}
          </label>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.storageVolume"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'red' }"
            :handle-style="{ borderColor: 'red' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.storageVolume"
          v-slot="{ handleChange, errorMessage }"
          name="storageVolume"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.storageVolume"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.storageVolumeSize"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'red' }"
            :handle-style="{ borderColor: 'red' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.storageVolumeSize"
          v-slot="{ handleChange, errorMessage }"
          name="storageVolumeSize"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.storageVolumeSize"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.storageVolumeSnapshot"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'red' }"
            :handle-style="{ borderColor: 'red' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.storageVolumeSnapshot"
          v-slot="{ handleChange, errorMessage }"
          name="storageVolumeSnapshot"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.storageVolumeSnapshot"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>

    <!-- 네트워크 -->
    <a-row class="form-row" :gutter="12">
      <div class="ant-form-item-label">
        <label for="basic_project">
          {{ t('common.content.network') }}
        </label>
      </div>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> {{ t('common.content.network') }} </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> {{ t('common.content.router') }} </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project">
            {{ t('common.content.port') }}
          </label>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.networkNetwork"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'green' }"
            :handle-style="{ borderColor: 'green' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.networkNetwork"
          v-slot="{ handleChange, errorMessage }"
          name="networkNetwork"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.networkNetwork"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.networkRouter"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'green' }"
            :handle-style="{ borderColor: 'green' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.networkRouter"
          v-slot="{ handleChange, errorMessage }"
          name="networkRouter"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.networkRouter"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.networkPort"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'green' }"
            :handle-style="{ borderColor: 'green' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.networkPort"
          v-slot="{ handleChange, errorMessage }"
          name="networkPort"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.networkPort"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> {{ t('common.content.subnet') }} </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> 서브넷 풀 </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project">
            {{ t('common.content.floating-ip') }}
          </label>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.networkSubnet"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'green' }"
            :handle-style="{ borderColor: 'green' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.networkSubnet"
          v-slot="{ handleChange, errorMessage }"
          name="networkSubnet"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.networkSubnet"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.networkSubnetPool"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'green' }"
            :handle-style="{ borderColor: 'green' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.networkSubnetPool"
          v-slot="{ handleChange, errorMessage }"
          name="networkSubnetPool"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.networkSubnetPool"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.networkFloatingIp"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'green' }"
            :handle-style="{ borderColor: 'green' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.networkFloatingIp"
          v-slot="{ handleChange, errorMessage }"
          name="networkFloatingIp"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.networkFloatingIp"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project">
            {{ t('common.content.security-group') }}
          </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project">
            {{ t('common.content.security-rule') }}
          </label>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.networkSecurityGroup"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'green' }"
            :handle-style="{ borderColor: 'green' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.networkSecurityGroup"
          v-slot="{ handleChange, errorMessage }"
          name="networkSecurityGroup"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.networkSecurityGroup"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.networkSecurityGroupRule"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'green' }"
            :handle-style="{ borderColor: 'green' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.networkSecurityGroupRule"
          v-slot="{ handleChange, errorMessage }"
          name="networkSecurityGroupRule"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.networkSecurityGroupRule"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>

    <!-- 공유 -->
    <a-row class="form-row" :gutter="12">
      <div class="ant-form-item-label">
        <label for="basic_project">
          {{ t('common.content.share') }}
        </label>
      </div>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> {{ t('common.content.share') }} </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> 공유 용량 </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> 공유 스냅샷 </label>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.share"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'blue' }"
            :handle-style="{ borderColor: 'blue' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.share"
          v-slot="{ handleChange, errorMessage }"
          name="share"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.share"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.shareSize"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'blue' }"
            :handle-style="{ borderColor: 'blue' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.shareSize"
          v-slot="{ handleChange, errorMessage }"
          name="shareSize"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.shareSize"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.shareSnapshot"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'blue' }"
            :handle-style="{ borderColor: 'blue' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.shareSnapshot"
          v-slot="{ handleChange, errorMessage }"
          name="shareSnapshot"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.shareSnapshot"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> 공유 스냅샷 용량 </label>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="ant-form-item-label">
          <label for="basic_project"> 공유 네트워크 </label>
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.shareSnapshotSize"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'blue' }"
            :handle-style="{ borderColor: 'blue' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.shareSnapshotSize"
          v-slot="{ handleChange, errorMessage }"
          name="shareSnapshotSize"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.shareSnapshotSize"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="6">
        <a-form-item style="width: 90%">
          <a-slider
            v-model:value="emitsQuotaInfoInfo.shareNetwork"
            :min="0"
            :max="20"
            :track-style="{ backgroundColor: 'blue' }"
            :handle-style="{ borderColor: 'blue' }"
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <Field
          v-model="emitsQuotaInfoInfo.shareNetwork"
          v-slot="{ handleChange, errorMessage }"
          name="shareNetwork"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 80%"
          >
            <a-input-number
              v-model:value="emitsQuotaInfoInfo.shareNetwork"
              @input="handleChange"
              :min="0"
              :max="20"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
  </a-form>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { Field } from 'vee-validate';
import { QuotaInfoType } from '@/types/identity/project/ProjectCreateType';

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  quotaInfo: {
    type: Object as () => QuotaInfoType,
    required: true,
  },
  isCheckValid: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    emitsQuotaInfoInfo.value = {
      // 컴퓨트
      computeInstance: props.quotaInfo?.computeInstance,
      computeVcpus: props.quotaInfo?.computeVcpus,
      computeMemory: props.quotaInfo?.computeMemory,
      computeRam: props.quotaInfo?.computeRam,
      computeServerGroup: props.quotaInfo?.computeServerGroup,
      computeServerGroupMaxMember: props.quotaInfo?.computeServerGroupMaxMember,
      computeKeyPair: props.quotaInfo?.computeKeyPair,
      // 스토리지
      storageVolume: props.quotaInfo?.storageVolume,
      storageVolumeSize: props.quotaInfo?.storageVolumeSize,
      storageVolumeSnapshot: props.quotaInfo?.storageVolumeSnapshot,
      // 네트워크
      networkNetwork: props.quotaInfo?.networkNetwork,
      networkRouter: props.quotaInfo?.networkRouter,
      networkPort: props.quotaInfo?.networkPort,
      networkSubnet: props.quotaInfo?.networkSubnet,
      networkSubnetPool: props.quotaInfo?.networkSubnetPool,
      networkFloatingIp: props.quotaInfo?.networkFloatingIp,
      networkSecurityGroup: props.quotaInfo?.networkSecurityGroup,
      networkSecurityGroupRule: props.quotaInfo?.networkSecurityGroupRule,
      // 공유
      share: props.quotaInfo?.share,
      shareSize: props.quotaInfo?.shareSize,
      shareSnapshot: props.quotaInfo?.shareSnapshot,
      shareSnapshotSize: props.quotaInfo?.shareSnapshotSize,
      shareNetwork: props.quotaInfo?.shareNetwork,
    };
  }
};

const emits = defineEmits(['update:quotaInfo', 'update:isCheckValid']);
const emitsQuotaInfoInfo = ref<QuotaInfoType>({
  // 컴퓨트
  computeInstance: 0,
  computeVcpus: 0,
  computeMemory: 0,
  computeRam: 0,
  computeServerGroup: 0,
  computeServerGroupMaxMember: 0,
  computeKeyPair: 0,
  // 스토리지
  storageVolume: 0,
  storageVolumeSize: 0,
  storageVolumeSnapshot: 0,
  // 네트워크
  networkNetwork: 0,
  networkRouter: 0,
  networkPort: 0,
  networkSubnet: 0,
  networkSubnetPool: 0,
  networkFloatingIp: 0,
  networkSecurityGroup: 0,
  networkSecurityGroupRule: 0,
  // 공유
  share: 0,
  shareSize: 0,
  shareSnapshot: 0,
  shareSnapshotSize: 0,
  shareNetwork: 0,
});

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

const setValidateFieldError = (field: string, error: string | undefined) => {
  props.validateForm.validateField(field).then((res: any) => {
    if (!res.valid) {
      props.validateForm.setFieldError(field, error);
    }
  });
};

onMounted(() => {
  initData();
});

onUnmounted(() => {
  emits('update:quotaInfo', emitsQuotaInfoInfo.value);
  emits('update:isCheckValid', true);
});
</script>
<style lang="scss" scoped></style>
