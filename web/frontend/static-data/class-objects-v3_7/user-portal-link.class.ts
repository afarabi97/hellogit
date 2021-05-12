import { UserPortalLinkClass }  from '../../src/app/classes';
import { MockUserPortalLinkInterface, MockUserPortalLinkRemoveInterface } from '../interface-objects-v3_7';

export const MockUserPortalLinkClass: UserPortalLinkClass = new UserPortalLinkClass(MockUserPortalLinkInterface);
export const MockUserPortalLinkRemoveClass: UserPortalLinkClass = new UserPortalLinkClass(MockUserPortalLinkRemoveInterface);
