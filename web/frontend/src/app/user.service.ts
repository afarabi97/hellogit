import { Injectable, Directive } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';
import { SnackbarWrapper } from './classes/snackbar-wrapper';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class UserService {
    public user;

    constructor() { }

    setUser(user) {
        this.user = user;
    }
    getUser() {
        return this.user;
    }
    isControllerAdmin() {
        return this.user.controller_admin;
    }
    isControllerMaintainer() {
        return this.user.controller_maintainer;
    }
    isOperator() {
        return this.user.operator;
    }
    isRealmAdmin() {
        return this.user.realm_admin;
    }
}

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private snackbar: SnackbarWrapper) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        let reload = () => window.location.reload();
        if (err.status === 401) {
          this.snackbar.showSnackBar('Unauthorized Request. Please reload the page to re-login', 10000, 'Reload Page', reload);
        } else if (err.status === 403) {
          this.snackbar.showSnackBar('Forbidden. You do not have permissions for this request', -1, 'Dismiss');
        }
      }
    });
  }
}

@Injectable()
export class ControllerAdminRequiredGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if(!this.userService.isControllerAdmin()) {
      return this.router.navigateByUrl('/portal', { state: { action: 'unauthorized_route' , route_name: state.url } });
    } else {
      return true;
    }
  }
}
@Injectable()
export class ControllerMaintainerRequiredGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if(!this.userService.isControllerMaintainer()) {
      return this.router.navigateByUrl('/portal', { state: { action: 'unauthorized_route' , route_name: state.url } });
    } else {
      return true;
    }
  }
}
@Injectable()
export class OperatorRequiredGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if(!this.userService.isOperator()) {
      return this.router.navigateByUrl('/portal', { state: { action: 'unauthorized_route' , route_name: state.url } });
    } else {
      return true;
    }
  }
}
