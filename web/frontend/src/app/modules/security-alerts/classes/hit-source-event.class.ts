import { ObjectUtilitiesClass } from '../../../classes';
import { HitSourceEventInterface } from '../interfaces';

/**
 * Class defines the Hit Source Event
 *
 * @export
 * @class HitSourceEventClass
 * @implements {HitSourceEventInterface}
 */
export class HitSourceEventClass implements HitSourceEventInterface {
  ingested: string;
  kind: string;
  created: string;
  module: string;
  type: string[];
  category: string[];
  dataset: string;
  id?: string;
  severity?: number;
  original?: string;
  serverity?: number;
  start?: string;
  hive_id?: number;

  /**
   * Creates an instance of HitSourceEventClass.
   *
   * @param {HitSourceEventInterface} hit_source_event_interface
   * @memberof HitSourceEventClass
   */
  constructor(hit_source_event_interface: HitSourceEventInterface) {
    this.ingested = hit_source_event_interface.ingested;
    this.kind = hit_source_event_interface.kind;
    this.created = hit_source_event_interface.created;
    this.module = hit_source_event_interface.module;
    this.type = hit_source_event_interface.type;
    this.category = hit_source_event_interface.category;
    this.dataset = hit_source_event_interface.dataset;
    if (ObjectUtilitiesClass.notUndefNull(hit_source_event_interface.id)) {
      this.id = hit_source_event_interface.id;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_event_interface.severity)) {
      this.severity = hit_source_event_interface.severity;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_event_interface.original)) {
      this.original = hit_source_event_interface.original;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_event_interface.serverity)) {
      this.serverity = hit_source_event_interface.serverity;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_event_interface.start)) {
      this.start = hit_source_event_interface.start;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_event_interface.hive_id)) {
      this.hive_id = hit_source_event_interface.hive_id;
    }
  }
}
