import { ChartInfoClass } from '../../src/app/classes';
import {
  MockChartInfoInterfaceArkime,
  MockChartInfoInterfaceArkimeViewerReinstallorUninstall,
  MockChartInfoInterfaceMisp,
  MockChartInfoInterfaceSuricata
} from '../interface-objects';

export const MockChartInfoClassArkime: ChartInfoClass = new ChartInfoClass(MockChartInfoInterfaceArkime);
export const MockChartInfoClassArkimeViewerReinstallorUninstall: ChartInfoClass = new ChartInfoClass(MockChartInfoInterfaceArkimeViewerReinstallorUninstall);
export const MockChartInfoClassMisp: ChartInfoClass = new ChartInfoClass(MockChartInfoInterfaceMisp);
export const MockChartInfoClassSuricata: ChartInfoClass = new ChartInfoClass(MockChartInfoInterfaceSuricata);
