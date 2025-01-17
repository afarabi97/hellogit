import { UserPortalLinkClass }  from '../../src/app/classes';
import { MockUserPortalLinkInterface, MockUserPortalLinkRemoveInterface } from '../interface-objects';

export const MockUserPortalLinkClass: UserPortalLinkClass = new UserPortalLinkClass(MockUserPortalLinkInterface);
export const MockUserPortalLinkRemoveClass: UserPortalLinkClass = new UserPortalLinkClass(MockUserPortalLinkRemoveInterface);
