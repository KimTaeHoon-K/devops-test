import { notification } from 'ant-design-vue';
import { h } from 'vue';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';
import { FixedIpType } from '@/types/network/common/NetworkCommonType';

export function confirmModalContentCreator(
  title: string,
  selectedData: any,
  id: string | undefined,
  data: string | undefined,
  dataColumn: string,
  confirmAction: string,
  t: any
) {
  let messageData = '';
  const noData = dataColumn === 'name' ? '(No name)' : '(No data)';
  if (!id) {
    messageData = `${selectedData.value.rows.map(
      (row: any) =>
        (row[dataColumn] ? row[dataColumn] : noData) + ' / ' + row.id
    )}`;
  } else {
    messageData = `${data ? data : noData} / ${id}`;
  }
  return t(`message.confirm.${confirmAction}`, {
    title: title,
    data: messageData,
  });
}

export function openNotification(
  isSuccess: boolean,
  message: string,
  style: string,
  duration?: number // seconds. default: 4.5
) {
  notification.open({
    message: message,
    icon: () =>
      h(isSuccess ? CheckCircleOutlined : ExclamationCircleOutlined, {
        style: style,
      }),
    duration: duration,
  });
}

// 특정 필드로 정렬. 기본 오름차순.
export function sortByField(array: any, field: string, order?: string) {
  const isAsc = !order || order === 'asc';
  return array.sort(function (a: any, b: any) {
    if (a[field] < b[field]) {
      if (isAsc) {
        return -1;
      }
      return 1;
    }
    if (a[field] > b[field]) {
      if (isAsc) {
        return 1;
      }
      return -1;
    }
    return 0;
  });
}

// 종성(받침) 유무 확인.
export function checkKoreanHasLastConsonant(koreanStr: string) {
  const lastChar = koreanStr.charCodeAt(koreanStr.length - 1);
  // true: has last consonant
  // false: does not have last consonant
  return !!((lastChar - 0xac00) % 28);
}

export function firstCharToUpperCase(str: string) {
  return str.replace(/^[a-z]/, (char) => char.toUpperCase());
}

export function getIpv4AddressList(ips: FixedIpType[]) {
  const regex =
    /(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}/;
  return ips.filter((ip) => regex.test(ip.ipAddress));
}

export function getIpv6AddressList(ips: FixedIpType[]) {
  const regex =
    /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
  return ips.filter((ip) => regex.test(ip.ipAddress));
}
