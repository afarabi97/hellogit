import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class AppLoadService {

  constructor(private httpClient: HttpClient, private userService: UserService) { }

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
}
