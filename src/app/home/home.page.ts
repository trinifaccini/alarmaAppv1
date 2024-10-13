import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Torch } from '@capawesome/capacitor-torch'; // Plugin de la linterna
import { Haptics } from '@capacitor/haptics'; // Plugin para vibración
import { Motion } from '@capacitor/motion'; 
import { Howl } from 'howler';
import { AuthService } from '../services/auth.service'; // Asegúrate de importar tu servicio de autenticación
import { User } from '@angular/fire/auth';


import { addIcons } from 'ionicons';
import {lockClosed, lockOpen, logOut, shield, shieldOutline, warningOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

addIcons({
  'shield-outline': shieldOutline,
  'shield': shield,
  'lock-open': lockOpen,
  'lock-closed': lockClosed,
  'warning-outline': warningOutline,
  'log-out': logOut

});


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})


export class HomePage implements OnDestroy {

  router = inject(Router);
  duration = 5000; // Duración en milisegundos (5 segundos)
  currentRepeat = 0;
  repeatCount = 0;
  
  alarmaActiva: boolean = false;
  mostrarModal: boolean = false;
  passwordIngresada: string = '';
  private orientacionSubscription: any;
  private usuario: User | null = null; // Agregar variable para el usuario

  private orientacionTimeout: any = null; // Agregar una variable para el temporizador

  // Variable para guardar la última orientación
  private ultimaOrientacion: string = '';
  
  audioIzquierda = new Howl({ src: ['assets/audios/izquierda.mp3'] });
  audioDerecha = new Howl({ src: ['assets/audios/derecha.mp3'] });
  audioVertical = new Audio('assets/audios/vertical.mp3');
  audioError = new Audio('assets/audios/error.mp3');
  audioHorizontal = new Audio('assets/audios/horizontal.mp3'); // Nuevo sonido para horizontal

  private vibrationInterval: any;
  private vibrationTimeout: any;

  startVibration() {
    // Comienza la vibración en intervalos pequeños (e.g., cada 500 ms)
    this.vibrationInterval = setInterval(() => {
      Haptics.vibrate();
    }, 100);

    // Programa la detención de la vibración después de 5 segundos
    this.vibrationTimeout = setTimeout(() => {
      this.stopVibration();
    }, 5000); // 5000 ms = 5 segundos
  }

  stopVibration() {
    // Limpia el intervalo para detener la vibración continua
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }

    // Limpia el timeout por si se detiene antes de tiempo
    if (this.vibrationTimeout) {
      clearTimeout(this.vibrationTimeout);
      this.vibrationTimeout = null;
    }
  }


  constructor(private platform: Platform, private authService: AuthService) {
    this.cargarUsuario();
  }

  async cargarUsuario() {
    this.usuario = await this.authService.getUser(); // Llama a getUser() y guarda el usuario
  }

  activarAlarma() {
    this.alarmaActiva = true;
    this.iniciarMonitoreoOrientacion(); 
  }

  iniciarMonitoreoOrientacion() {
    this.orientacionSubscription = Motion.addListener('orientation', (event: any) => {

    if (!this.alarmaActiva || this.orientacionTimeout) return; // Salir si ya está en espera

      const gamma = event.gamma;
      const beta = event.beta;
      const movimientoUmbral = 15; 

      const nuevaOrientacion = this.obtenerEstadoInclinacion(gamma, beta, movimientoUmbral);

      if (nuevaOrientacion && nuevaOrientacion !== this.ultimaOrientacion) {
        // Reproducir sonido solo si la orientación cambió
        this.reproducirSonido(nuevaOrientacion);
        this.ultimaOrientacion = nuevaOrientacion;

        if (nuevaOrientacion === 'vertical') {
          Torch.enable(); // Encender la linterna
          setTimeout(() => Torch.disable(), 5000); // Apagar después de 5 segundos
        }

        this.orientacionTimeout = setTimeout(() => {
          this.orientacionTimeout = null; // Restablecer el temporizador después de 2 segundos
        }, 2000); // 2000 ms = 2 segundos
      }
    });
  }

  obtenerEstadoInclinacion(gamma: number, beta: number, umbral: number): string {

    if (Math.abs(gamma) > umbral) {
      if (gamma < -30) {
        this.stopVibration();
        return 'izquierda'; // Ajusta el valor según la sensibilidad deseada}
      }

      else if (gamma > 30) {
        this.stopVibration();
        return 'derecha';
      }
    }
    
    if (Math.abs(beta) > 70){
      this.stopVibration();
      return 'vertical'; // Baja un poco el valor para detectar mejor la vertical
    }
    if (Math.abs(gamma) < 10 && Math.abs(beta) < 20) return 'horizontal'; // Ampliar el rango horizontal
    
    return ''; // Si no cumple ninguna condición
  }

  

  reproducirSonido(direccion: string) {
    this.stopAllSounds();

    switch (direccion) {
      case 'izquierda':
        Torch.disable()
        this.audioIzquierda.play();
        break;
      case 'derecha':
        Torch.disable()
        this.audioDerecha.play();
        break;
      case 'vertical':
        this.audioVertical.play();
        break;
      case 'horizontal':
        this.audioHorizontal.play();
        this.vibrar();
      break;
    }
  }
  
  vibrar() {
    this.startVibration();
  }

  stopAllSounds() {
    this.audioIzquierda.stop();
    this.audioDerecha.stop();
    this.audioVertical.pause();
    this.audioHorizontal.pause();
    this.audioError.pause();
  }

  mostrarDialogoDesactivacion() {
    this.mostrarModal = true;
  }

  async verificarPassword() {
    if (this.usuario) { // Asegúrate de que el usuario está disponible
      try {
        // Llama a la función de inicio de sesión usando el email del usuario
        await this.authService.login(this.usuario.email!, this.passwordIngresada);
        this.desactivarAlarma(); // Desactiva la alarma si el inicio de sesión es exitoso
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        this.activarAlarmaError(); // Maneja el error
      } finally {
        this.passwordIngresada = '';
        this.mostrarModal = false;
      }
    } else {
      console.error('No hay usuario autenticado.');
      // Aquí puedes manejar el caso en que no haya usuario autenticado
    }
  }

  desactivarAlarma() {
    this.alarmaActiva = false;
    Torch.disable(); // Apagar la linterna
    this.ultimaOrientacion = ''; // Restablecer la última orientación
    this.stopAllSounds();
  }

  activarAlarmaError() {
    this.vibrar();
    this.audioError.play()
    Torch.enable();
    setTimeout(() => Torch.disable(), 5000);
  }

 
  logout(): void {
    this.authService.logout();
    this.stopAllSounds();
    //desctivar vibración
    this.orientacionSubscription.remove(); // Limpia la suscripción al destruir el componente
    this.router.navigate(['/login']);
  
  }

  ngOnDestroy() {
    this.orientacionSubscription.remove(); // Limpia la suscripción al destruir el componente
    this.stopAllSounds();
  }
}
