import { PortalLinkClass } from '../../src/app/classes';
import { MockPortalLinkInterface, MockPortalLinkFakeInterface } from '../interface-objects';

export const MockPortalLinkClass: PortalLinkClass = new PortalLinkClass(MockPortalLinkInterface);
export const MockPortalLinkFakeClass: PortalLinkClass = new PortalLinkClass(MockPortalLinkFakeInterface);
