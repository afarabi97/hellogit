import { MockElasticsearchNodeClass } from '../../../../../static-data/class-objects';
import { SLIDER_PROGRAMMING_ERROR_TITLE } from '../constants/elasticsearch-scale.constant';
import { NodeTitleEnum } from '../enums/node-title.enum';
import { SliderControlClass } from './slider-control.class';

describe('SliderControlClass', () => {

  describe('new SliderControlClass', () => {
    it(`should create new SliderControlClass`, () => {
      const value: SliderControlClass = new SliderControlClass('master', MockElasticsearchNodeClass);

      expect(value).toBeDefined();
    });

    it(`should return array of new SliderControlClass for defined type`, () => {
      const enum_keys_: string[] = Object.keys(NodeTitleEnum);
      const slider_controls: SliderControlClass[] = enum_keys_.map((v: string) => new SliderControlClass(v, MockElasticsearchNodeClass));

      expect(slider_controls.length).toEqual(4);
    });

    it(`should return new SliderControlClass for none defined type with error title`, () => {
      const slider_control: SliderControlClass = new SliderControlClass('test', MockElasticsearchNodeClass);

      expect(slider_control.title).toEqual(SLIDER_PROGRAMMING_ERROR_TITLE);
    });

    it(`should return new SliderControlClass for none defined type with all counts set to zero`, () => {
      const slider_control: SliderControlClass = new SliderControlClass('test', MockElasticsearchNodeClass);

      expect(slider_control.current_count).toEqual(0);
      expect(slider_control.max_count).toEqual(0);
    });

    it(`should return new SliderControlClass and set hidden true when current_count === 0`, () => {
      const slider_control: SliderControlClass = new SliderControlClass('test', MockElasticsearchNodeClass);

      expect(slider_control.hidden).toBeTrue();
    });
  });
});
