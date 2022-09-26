import { ObjectUtilitiesClass } from '../../../classes';
import { HitSourceInterface } from '../interfaces';
import { HitSourceDestinationClass } from './hit-source-destination.class';
import { HitSourceEventClass } from './hit-source-event.class';
import { HitSourceRuleClass } from './hit-source-rule.class';
import { HitSourceSourceClass } from './hit-source-source.class';

/**
 * Class defines the Hit Source
 *
 * @export
 * @class HitSourceClass
 * @implements {HitSourceInterface}
 */
export class HitSourceClass implements HitSourceInterface {
  agent: {
    hostname: string;
    name: string;
    id: string;
    type: string;
    ephemeral_id: string;
    version: string;
  };
  log: {
    file: {
      path: string;
    };
    offset: number;
  };
  fileset: {
    name: string;
  };
  tags: string[];
  input: {
    type: string;
  };
  observer: {
    hostname: string;
  };
  '@timestamp': string;
  ecs: {
    version: string;
  };
  related: {
    ip: string[];
  };
  service: {
    type: string;
  };
  'network.direction': string;
  signal?: {
    rule: {
      name: string;
    };
  };
  rule?: HitSourceRuleClass;
  event?: HitSourceEventClass;
  destination?: HitSourceDestinationClass;
  source?: HitSourceSourceClass;
  _type?: string;
  message?: string;
  network?: {
    bytes: number;
    community_id: string;
    packets: number;
    protocol: string;
    transport: string;
  };
  zeek?: {
    weird: {
      peer: string;
      name: string;
      source: string;
      notice: boolean;
    };
    session_id: string;
  };
  suricata?: {
    eve: {
      community_id: string;
      event_type: string;
      flow: Object;
      flow_id: string;
      in_iface: string;
      alert: {
        attack_target: string[];
        category: string;
        created_at: string;
        gid: number;
        rev: number;
        signature: string;
        signature_id: number;
        updated_at: string;
        metadata: {
          affected_product: string[];
          deployment: string[];
          former_category: string[];
          performance_impact: string[];
          signature_severity: string[];
        };
      };
    };
  };

  /**
   * Creates an instance of HitSourceClass.
   *
   * @param {HitSourceInterface} hit_source_interface
   * @memberof HitSourceClass
   */
  constructor(hit_source_interface: HitSourceInterface) {
    this.agent = hit_source_interface.agent;
    this.log = hit_source_interface.log;
    this.fileset = hit_source_interface.fileset;
    this.tags = hit_source_interface.tags;
    this.input = hit_source_interface.input;
    this.observer = hit_source_interface.observer;
    this['@timestamp'] = hit_source_interface['@timestamp'];
    this.ecs = hit_source_interface.ecs;
    this.related = hit_source_interface.related;
    this.service = hit_source_interface.service;
    this['network.direction'] = hit_source_interface['network.direction'];
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface.signal)) {
      this.signal = hit_source_interface.signal;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface.rule)) {
      this.rule = new HitSourceRuleClass(hit_source_interface.rule);
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface.event)) {
      this.event = new HitSourceEventClass(hit_source_interface.event);
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface.destination)) {
      this.destination = new HitSourceDestinationClass(hit_source_interface.destination);
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface.source)) {
      this.source = new HitSourceSourceClass(hit_source_interface.source);
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface._type)) {
      this._type = hit_source_interface._type;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface.message)) {
      this.message = hit_source_interface.message;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface.network)) {
      this.network = hit_source_interface.network;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface.zeek)) {
      this.zeek = hit_source_interface.zeek;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_interface.suricata)) {
      this.suricata = hit_source_interface.suricata;
    }
  }
}
