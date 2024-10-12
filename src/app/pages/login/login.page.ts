


import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MatButton } from '@angular/material/button';
import { AuthServiceTrini } from 'src/app/services/auth.service-trini';
import { IonicModule } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { colorFillOutline, logInOutline } from 'ionicons/icons';

addIcons({
  'color-fill-outline': colorFillOutline,
  'log-in-outline': logInOutline
});



const authReponses = {
  //"invalid-email": "No existe un usuario registrado con esa dirección",
  //"missing-password": "No existe un usuario registrado con esa dirección",
  "invalid-credential": "No existe ese correo o esa combinacion de correo y contraseña",
  "too-many-requests": "Muchas solicitudes, intente en unos minutos",
}

const users = [
  {
    username: "admin1",
    email: "admin@admin.com",
    password: "111111"
  },
  {
    email: "usuario@usuario.com",
    username: "usuario2",
    password: "222222"
  },
  {
    username: "tomi_acu",
    email: "tomas_acu@gmail.com",
    password: "acunia12"
  }
]


@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatButton, IonicModule]
})


export class LoginPage implements OnInit, OnDestroy {
  
    authService = inject(AuthServiceTrini)
    fb = inject(FormBuilder)
    router = inject(Router)

    loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

  errorMessage: string = '';

  constructor(private formBuilder: FormBuilder) {}


  onSubmit() : void {

    console.log('login');

    const rawForm = this.loginForm.getRawValue()

    this.authService
    .login(rawForm.email, rawForm.password)
    .subscribe(
      {
        next: () => {
          this.router.navigateByUrl('/home')
          this.loginForm.reset();

        },
        error: (err) => {
      
          const cleanedErrorCode = err.code.replace("auth/", "") as keyof typeof authReponses;
          this.errorMessage = authReponses[cleanedErrorCode];

          console.log(this.errorMessage)
        }   
      })

  } 


  hide = signal(true);
  
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }


  autocompleCredentials(userIndex: any) {

    this.loginForm.setValue({
      email: users[userIndex].email,
      password: users[userIndex].password
    });
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit() {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

}
