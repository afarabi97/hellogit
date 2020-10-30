import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class ControllerMaintainerRequiredGuard implements CanActivate {

  /**
   * Creates an instance of ControllerMaintainerRequiredGuard.
   *
   * @param {UserService} userService_
   * @param {Router} router_
   * @memberof ControllerMaintainerRequiredGuard
   */
  constructor(private userService_: UserService,
              private router_: Router) {}

  /**
   * Can active controller maintainer guard
   *
   * @param {ActivatedRouteSnapshot} _next
   * @param {RouterStateSnapshot} state
   * @returns {(true | Promise<boolean>)}
   * @memberof ControllerMaintainerRequiredGuard
   */
  canActivate(_next: ActivatedRouteSnapshot, state: RouterStateSnapshot): true | Promise<boolean> {
    if(!this.userService_.isControllerMaintainer()) {

      return this.router_.navigateByUrl('/portal', { state: { action: 'unauthorized_route' , route_name: state.url } });
    } else {

      return true;
    }
  }
}
