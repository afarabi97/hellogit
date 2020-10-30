import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class OperatorRequiredGuard implements CanActivate {

  /**
   * Creates an instance of OperatorRequiredGuard.
   *
   * @param {UserService} userService_
   * @param {Router} router_
   * @memberof OperatorRequiredGuard
   */
  constructor(private userService_: UserService,
              private router_: Router) {}

  /**
   * Can active operator guard
   *
   * @param {ActivatedRouteSnapshot} _next
   * @param {RouterStateSnapshot} state
   * @returns
   * @memberof OperatorRequiredGuard
   */
  canActivate(_next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if(!this.userService_.isOperator()) {

      return this.router_.navigateByUrl('/portal', { state: { action: 'unauthorized_route' , route_name: state.url } });
    } else {

      return true;
    }
  }
}
