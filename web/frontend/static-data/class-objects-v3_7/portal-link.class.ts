import { PortalLinkClass } from '../../src/app/classes';
import { MockPortalLinkInterface, MockPortalLinkFakeInterface } from '../interface-objects-v3_7';

export const MockPortalLinkClass: PortalLinkClass = new PortalLinkClass(MockPortalLinkInterface);
export const MockPortalLinkFakeClass: PortalLinkClass = new PortalLinkClass(MockPortalLinkFakeInterface);
