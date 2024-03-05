export interface DoughnutType {
  total?: number;
  used?: number;
  available?: number;
  data: ChartType;
}

export interface LineType {
  data: ChartType;
}
interface ChartType {
  labels: string[];
  datasets: any[];
}

export interface AxisType {
  display: boolean;
  title: AxisTitleType;
}
interface AxisTitleType {
  display: boolean;
  text: string;
}

export interface EDoughnutChartType {
  total?: number;
  used?: number;
  available?: number;
  data: EDoughnutChartDataType[];
}
interface EDoughnutChartDataType {
  value: number;
  name: string;
}

export interface ELineChartType {
  legend?: object;
  xAxis: EAxisType;
  yAxis: EAxisType;
  series: ChartSeriesType[];
}
interface EAxisType {
  type: string; // value / category / time / log
  name?: string;
  nameLocation?: string; // start / center | middle / end
  nameRotate?: number;
  nameGap?: number; // Gap between axis name and axis line.
  boundaryGap?: boolean;
  data?: any[];
}

interface ChartSeriesType {
  name?: string;
  type: string;
  data: any[];
}

export interface EGraphChartType {
  nodes: EGraphChartNodeType[];
  links: EGraphChartLinkType[];
  categories: EGraphChartCategoryType[];
}
interface EGraphChartNodeType {
  id: string;
  name: string;
  symbol: string;
  symbolSize: number;
  symbolKeepAspect: boolean;
  category: string | number;
  clickable: boolean;
  itemStyle?: any;
  meta?: any;
}
interface EGraphChartLinkType {
  source: string; // source node id
  target: string; // target node id
}
interface EGraphChartCategoryType {
  name: string;
}
