import { EndgameSensorProfileClass } from '../../src/app/modules/agent-builder-chooser/classes/endgame-sensor-profile.class';
import {
    MockEndgameSensorProfileInterface1,
    MockEndgameSensorProfileInterface2,
    MockEndgameSensorProfileInterface3
} from '../interface-objects';

export const MockEndgameSensorProfileClass1: EndgameSensorProfileClass = new EndgameSensorProfileClass(MockEndgameSensorProfileInterface1);
export const MockEndgameSensorProfileClass2: EndgameSensorProfileClass = new EndgameSensorProfileClass(MockEndgameSensorProfileInterface2);
export const MockEndgameSensorProfileClass3: EndgameSensorProfileClass = new EndgameSensorProfileClass(MockEndgameSensorProfileInterface3);
export const MockEndgameSensorProfileClasses: EndgameSensorProfileClass[] = [
  MockEndgameSensorProfileClass1,
  MockEndgameSensorProfileClass2,
  MockEndgameSensorProfileClass3
];
