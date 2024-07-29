import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {
  public isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  public isValidPassword(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!#$%^&*])[A-Za-z\d!#$%^&*]{8,16}$/;
    return regex.test(password);
  }

  public isValidPhoneNumber(number: string) {
    //just Korean
    const regex = /^(?:0[1-9][0-9]|0[2-9][0-9]|[1-9][0-9]{1,2})[0-9]{7,8}$/;
    return regex.test(number);
  }

  public isValidUserName(userName: string) {
    const regex = /^[a-zA-Z0-9]{3,50}$/;
    return regex.test(userName);
  }
}


export default ValidatorService;