import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class ControllerAdminRequiredGuard implements CanActivate {

  /**
   * Creates an instance of ControllerAdminRequiredGuard.
   *
   * @param {UserService} userService_
   * @param {Router} router_
   * @memberof ControllerAdminRequiredGuard
   */
  constructor(private userService_: UserService,
              private router_: Router) {}

  /**
   * Can active controller admin guard
   *
   * @param {ActivatedRouteSnapshot} _next
   * @param {RouterStateSnapshot} state
   * @returns
   * @memberof ControllerAdminRequiredGuard
   */
  canActivate(_next: ActivatedRouteSnapshot, state: RouterStateSnapshot): true | Promise<boolean> {
    if(!this.userService_.isControllerAdmin()) {

      return this.router_.navigateByUrl('/portal', { state: { action: 'unauthorized_route' , route_name: state.url } });
    } else {

      return true;
    }
  }
}
