import { defineRule } from 'vee-validate';
import { checkKoreanHasLastConsonant } from '@/utils/CommonUtil';

// 필수 입력 유효성 체크
defineRule('conInputRequired', (value: string | number, data: string[]) => {
  if (value === null || value === undefined || value === '') {
    if (checkKoreanHasLastConsonant(data[0])) {
      return `${data}을 입력해 주세요.`;
    } else {
      return `${data}를 입력해 주세요.`;
    }
  }
  return true;
});

// 필수 선택 유효성 체크
defineRule('conSelectRequired', (value: string | number, data: string) => {
  if (value === undefined || value === '') {
    return `${data}을 선택해 주세요.`;
  }
  return true;
});

// 필수 다중 선택 유효성 체크
defineRule(
  'conMultipleSelectRequired',
  (value: string[] | number[], data: string) => {
    if (value === undefined || value.length === 0 || value === []) {
      return `${data}을 선택해 주세요.`;
    }
    return true;
  }
);

// 필수 파일 업로드 유효성 체크
defineRule('conUploadRequired', (value: File, data: string) => {
  if (value === undefined || value === null || !value.name) {
    return `${data}을 업로드해 주세요.`;
  }
  return true;
});

// 특정 값보다 큰 값 입력 유효성 체크
defineRule('conInputGreaterThan', (value: number, thanValue: number[]) => {
  // TODO: 구조 파악...
  if (value <= thanValue[0]) {
    // TODO: 문구 정책 생길 시 변경
    return `${thanValue}보다 큰 값을 입력해 주세요.`;
  }
  return true;
});

// 특정 값보다 크거나 같은 값 입력 유효성 체크
defineRule(
  'conInputGreaterThanOrEqualTo',
  (value: number, thanValue: number[]) => {
    // TODO: 구조 파악...
    if (value && value < thanValue[0]) {
      // TODO: 문구 정책 생길 시 변경
      return `${thanValue}보다 크거나 같은 값을 입력해 주세요.`;
    }
    return true;
  }
);

// 특정 값보다 큰 값을 가진 입력 값 선택 유효성 체크 > 인스턴스 생성 > 인스턴스 유형
defineRule('conSelectGreaterThan', (value: number, params: any) => {
  if (value <= params.thanValue) {
    // TODO: 문구 정책 생길 시 변경
    return `${params.thanLabel} 가 ${params.thanValue}보다 큰 값을 선택해 주세요.`;
  }
  return true;
});

// 특정 값보다 크거나 같은 값을 가진 입력 값 선택 유효성 체크 > 인스턴스 생성 > 인스턴스 유형
defineRule('conSelectGreaterThanOrEqualTo', (value: number, params: any) => {
  if (value < params.thanValue) {
    // TODO: 문구 정책 생길 시 변경
    return `${params.thanLabel} 가 ${params.thanValue}보다 크거나 같은 값을 선택해 주세요.`;
  }
  return true;
});

// 특정 값 사이의 값 입력 유효성 체크
defineRule('conInputBetween', (value: number, betweenValue: number[]) => {
  if (value && (value < betweenValue[0] || value > betweenValue[1])) {
    // TODO: 문구 정책 생길 시 변경
    return `${betweenValue[0]} ~ ${betweenValue[1]} 사이의 값을 입력해 주세요.`;
  }
  return true;
});

// 입력값 글자수 제한 유효성 체크
defineRule('conInputMaxText', (value: string, max: number) => {
  if (value && value.length > max) {
    return `${max}자 이내로 입력해 주세요.`;
  }
  return true;
});

// 공백X, 영어 소문자 유효성 체크
defineRule('conInputEngLowerCase', (value: string) => {
  const regex = /^[a-z\\-]+$/;
  if (!regex.test(value)) {
    return `공백 없이 영어 소문자, '-'만 입력 가능합니다.`;
  }
  return true;
});

// 공백 X 유효성 체크
defineRule('conInputNotBlank', (value: string | number) => {
  if (!value) {
    return true;
  }
  const regex = /\s/g;
  if (value.toString().match(regex)) {
    return `공백을 입력할 수 없습니다.`;
  }
  return true;
});

// 숫자만 입력 가능 유효성 체크
defineRule('conInputOnlyNumber', (value: string) => {
  const regex = /^[0-9]+$/;
  if (!regex.test(value)) {
    return `숫자만 입력 가능 합니다.`;
  }
  return true;
});

// 0 이상 정수(자연수)만 입력 가능 유효성 체크
defineRule('conInputOnlyNaturalNumber', (value: string) => {
  const regex = /^[0-9]*$/;
  if (value && !regex.test(value)) {
    return `정수인 숫자만 입력 가능 합니다.`;
  }
  return true;
});

// TODO: regex 점검...
// IPv4 유효성 체크
defineRule('conInputIpv4', (value: string) => {
  const regex =
    /(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}/;
  if (value && !regex.test(value)) {
    return `유효한 IP를 입력해 주세요.`;
  }
  return true;
});

// IPv6 유효성 체크
defineRule('conInputIpv6', (value: string) => {
  const regex =
    /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
  if (value && !regex.test(value)) {
    return `유효한 IP를 입력해 주세요.`;
  }
  return true;
});

// IPv4 CIDR 유효성 체크
defineRule('conInputIpv4Cidr', (value: string) => {
  const regex = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
  if (value && !regex.test(value)) {
    return `유효한 IP를 입력해 주세요.`;
  }
  return true;
});

// IPv4 CIDR 유효성 체크
defineRule('conInputIpv6Cidr', (value: string) => {
  const regex =
    /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;
  if (value && !regex.test(value)) {
    return `유효한 IP를 입력해 주세요.`;
  }
  return true;
});

// Mac Address 유효성 체크
defineRule('conInputMacAddress', (value: string) => {
  const regex = /^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/;
  if (value && !regex.test(value)) {
    return `유효한 Mac Address를 입력해 주세요.`;
  }
  return true;
});
