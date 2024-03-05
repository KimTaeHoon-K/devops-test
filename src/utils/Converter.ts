import dayjs from 'dayjs';

// 날짜 변환 함수
export function dateConverter(date: any, format: string) {
  return dayjs(date).format(format);
}

// 날짜 변환 함수 (timestamp -> format date)
export function timestampToDateConverter(
  timestamp: number,
  format: string
): string {
  return dayjs(timestamp * 1000).format(format);
}

// 용량 변환 함수 : 단위 붙여 주기
export function coreConverter(size: any) {
  return size + ' Core';
}

// 용량 변환 함수 (GiB -> GiB) : 소숫점, 단위 붙여 주기
export function gibConverter(size: any) {
  return Number(size).toFixed(1) + ' GiB';
}

// 용량 변환 함수 (bytes -> GiB)
export function bytesToGibConverter(size: number) {
  return (size / 1024 ** 3).toFixed(1) + ' GiB';
}

// 용량 변환 함수 (bytes -> GiB) 단위 없이
export function bytesToGibConverterWithoutUnit(size: number) {
  return (size / 1024 ** 3).toFixed(1);
}

// 용량 변환 함수 (mb -> GiB)
export function mbToGibConverter(size: number) {
  return ((size * 1000 ** 2) / 1024 ** 3).toFixed(1) + ' GiB';
}

// 용량 변환 함수 (mb -> GiB) 단위 없이
export function mbToGibConverterWithoutUnit(size: number): number {
  return Number(((size * 1000 ** 2) / 1024 ** 3).toFixed(1));
}

// 용량 변환 함수 (mib -> GiB)
export function mibToGibConverter(size: number) {
  return (size / 1024).toFixed(1) + ' GiB';
}

// 용량 변환 함수 (gb -> GiB)
export function gbToGibConverter(size: number) {
  return ((size * 1000) / 1024).toFixed(1) + ' GiB';
}

// 용량 변환 함수 (bits -> Mbits) 단위 없이
export function bitsToMbitsConverterWithoutUnit(size: number) {
  return (size / 1000 ** 2).toFixed(1);
}

// 백분율 변환 함수(%)
export function percentageConverter(part: number, total: number): number {
  return Number(((part / total) * 100).toFixed(1));
}

// 값 없을 때 '-' 처리하는 함수
export function nullConverter(data: any) {
  if (!data || data === '' || data === 0) {
    return '-';
  } else {
    return data;
  }
}

// string 배열 -> string format 변경
// ex) ['a','b','c'] -> a,b,c
export function changeArrayFormat(arr: string[]): string {
  if (arr && arr.length > 0) {
    return arr.join(', \n');
  } else {
    return '';
  }
}

// 다중 선택 배열 줄이는 함수
export function slicedArr(arr: string[]) {
  if (arr && arr.length > 2) {
    const newArr = arr?.slice(0, 2);
    return newArr.concat('...');
  } else {
    return arr;
  }
}

export function getStatusToUpperCase(status: string) {
  return status.toUpperCase();
}

export function getInstanceStatus(status: number) {
  // TODO: 상태 추가 필요
  switch (status) {
    case 1:
      return 'Running';
    case 3:
      return 'Paused';
    case 4:
      return 'Shut Down';
    case 6:
      return 'Crashed';
    case 7:
      return 'Suspended';
  }
}
