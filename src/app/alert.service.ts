import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export default class AlertService {
   showToast(text: string, icon: 'success' | 'error' | 'warning' | 'info') {
    Swal.fire({
      text,
      icon,
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 5000,
    });
  }

  showAlert(title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info', btnText = "확인") {
    Swal.fire({
      title,
      text,
      icon,
      showConfirmButton: true,
      confirmButtonText: btnText,
    });
  }

  showConfirm(
    title: string,
    text: string,
    confirmButtonText: string,
    cancelButtonText: string,
    confirmButtonColor?: string,
    cancelButtonColor?: string
  ) {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor || '#3085d6',
      cancelButtonColor: cancelButtonColor || '#d33',
      confirmButtonText,
      cancelButtonText,
    }).then((result) => {
      if(result.isConfirmed) {
        return true
      }
      return false;
    })
  }
}
