import { ChartClass } from '../../src/app/classes';
import {
  MockChartInterfaceArkime,
  MockChartInterfaceArkimeViewer,
  MockChartInterfaceCortex,
  MockChartInterfaceHive,
  MockChartInterfaceLogstash,
  MockChartInterfaceMattermost,
  MockChartInterfaceMisp,
  MockChartInterfaceNetflowFilebeat,
  MockChartInterfaceNIFI,
  MockChartInterfaceRedmine,
  MockChartInterfaceRemoteHealthAgent,
  MockChartInterfaceRocketchat,
  MockChartInterfaceSuricata,
  MockChartInterfaceWikiJs,
  MockChartInterfaceZeek,
  MockChartInterfaceZeekFailed,
  MockChartInterfaceZeekUninstalling
} from '../interface-objects';

export const MockChartClassArkime: ChartClass = new ChartClass(MockChartInterfaceArkime);
export const MockChartClassArkimeViewer: ChartClass = new ChartClass(MockChartInterfaceArkimeViewer);
export const MockChartClassCortex: ChartClass = new ChartClass(MockChartInterfaceCortex);
export const MockChartClassHive: ChartClass = new ChartClass(MockChartInterfaceHive);
export const MockChartClassLogstash: ChartClass = new ChartClass(MockChartInterfaceLogstash);
export const MockChartClassMattermost: ChartClass = new ChartClass(MockChartInterfaceMattermost);
export const MockChartClassMisp: ChartClass = new ChartClass(MockChartInterfaceMisp);
export const MockChartClassNetflowFilebeat: ChartClass = new ChartClass(MockChartInterfaceNetflowFilebeat);
export const MockChartClassNIFI: ChartClass = new ChartClass(MockChartInterfaceNIFI);
export const MockChartClassRedmine: ChartClass = new ChartClass(MockChartInterfaceRedmine);
export const MockChartClassRemoteHealthAgent: ChartClass = new ChartClass(MockChartInterfaceRemoteHealthAgent);
export const MockChartClassRocketchat: ChartClass = new ChartClass(MockChartInterfaceRocketchat);
export const MockChartClassSuricata: ChartClass = new ChartClass(MockChartInterfaceSuricata);
export const MockChartClassWikiJs: ChartClass = new ChartClass(MockChartInterfaceWikiJs);
export const MockChartClassZeek: ChartClass = new ChartClass(MockChartInterfaceZeek);
export const MockChartClassZeekFailed: ChartClass = new ChartClass(MockChartInterfaceZeekFailed);
export const MockChartClassZeekUninstalling: ChartClass = new ChartClass(MockChartInterfaceZeekUninstalling);
export const MockChartClassArray: ChartClass[] = [
  MockChartClassArkime,
  MockChartClassArkimeViewer,
  MockChartClassCortex,
  MockChartClassHive,
  MockChartClassLogstash,
  MockChartClassMattermost,
  MockChartClassMisp,
  MockChartClassNetflowFilebeat,
  MockChartClassNIFI,
  MockChartClassRedmine,
  MockChartClassRemoteHealthAgent,
  MockChartClassRocketchat,
  MockChartClassSuricata,
  MockChartClassWikiJs,
  MockChartClassZeek
];
