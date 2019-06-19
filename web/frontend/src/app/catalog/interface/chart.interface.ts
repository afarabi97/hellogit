

/**
 * class for the Chart object
 *
 * @export
 * @class Chart
 */
export class Chart {
  id: string;
  type: string;
  attributes: ChartAttributes;
  formControls: FormControls[];
}

/**
 * class for the chart Attributes that live inside the Chart object
 *
 * @export
 * @class ChartAttributes
 */
export class ChartAttributes {
  description: string;
  name: string;
  icon: string;
  home: string;
  verison: string;
  keywords: string[];
}

/**
 * class for the FormControll that live inside the Chart object
 *
 * @export
 * @class FormControls
 */
export class FormControls {
  type: string;
  default_value: string;
  description: string;
  required: boolean;
  regexp: string;
  name: string;
  error_message?: string;
}

/**
 * Class for the Node object
 *
 * @export
 * @interface INodeInfo
 */
export interface INodeInfo {
  hostname: string;
  application: string;
  status: string;
  version: any;
  interfaces: string[];
  node_state: string;
  process_list: Array<any>;
};
