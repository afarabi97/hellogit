

/**
 * class for the Chart object
 *
 * @export
 * @class Chart
 */
export class Chart {
  appVersion: string;
  application: string;
  description: string;
  nodes?: INodeInfo[];
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
 * class for the Chart Info object
 *
 * @export
 * @class ChartInfo
 */
export class ChartInfo {
  appVersion: string;
  description: string;
  formControls: any;
  id: string;
  type: string;
  version: string;
  node_affinity: string;
  devDependent?: string;
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
  node_type: string;
  process_list?: Array<any>;
  appVersion: string;
};
