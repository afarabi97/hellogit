import { HitSourceDestinationInterface } from './hit-source-destination.interface';
import { HitSourceEventInterface } from './hit-source-event.interface';
import { HitSourceRuleInterface } from './hit-source-rule.interface';
import { HitSourceSourceInterface } from './hit-source-source.interface';

/**
 * Interface defines the Hit Source
 *
 * @export
 * @interface HitSourceInterface
 */
export interface HitSourceInterface {
  '@timestamp': string;
  agent?: {
    hostname: string;
    name: string;
    id: string;
    type: string;
    ephemeral_id: string;
    version: string;
  };
  log?: {
    file: {
      path: string;
    };
    offset: number;
  };
  fileset?: {
    name: string;
  };
  tags?: string[];
  input?: {
    type: string;
  };
  observer?: {
    hostname: string;
  };
  ecs?: {
    version: string;
  };
  related?: {
    ip: string[];
  };
  service?: {
    type: string;
  };
  'network.direction'?: string;
  rule?: HitSourceRuleInterface;
  event?: HitSourceEventInterface;
  destination?: HitSourceDestinationInterface;
  source?: HitSourceSourceInterface;
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
  signal?: {
    rule: {
      name: string;
    };
  };
}
