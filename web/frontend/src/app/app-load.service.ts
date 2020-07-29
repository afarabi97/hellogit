import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UserService } from './user.service';
import { WeaponSystemNameService } from './services/weapon-system-name.service';

@Injectable()
export class AppLoadService {

  constructor(private httpClient: HttpClient, private userService: UserService, private weaponSystemNameService: WeaponSystemNameService) { }

  initializeApp(): Promise<any> {
    return new Promise((resolve, reject) => {
          console.log(`initializeApp:: inside promise`);

          setTimeout(() => {
            console.log(`initializeApp:: inside setTimeout`);
            // doing something

            resolve();
          }, 3000);
        });
  }

  getCurrentUser(): Promise<any> {
    console.log(`getCurrentUser:: before http.get call`);
    const promise = this.httpClient.get('/api/current_user')
      .toPromise()
      .then(user => {
        this.userService.setUser(user)
        return user;
      });
    return promise;
  }

  getSystemName(): Promise<any> {
    console.log(`getCurrentUser:: before http.get call`);
    const promise = this.httpClient.get('/api/get_system_name')
      .toPromise()
      .then(system_name => {
        this.weaponSystemNameService.setSystemName(system_name["system_name"]);
        return system_name;
      });
    return promise;
  }
}
