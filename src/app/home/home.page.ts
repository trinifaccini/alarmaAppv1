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
  audioVertical = new Howl({ src: ['assets/audios/vertical.mp3'] });
  audioError = new Howl({ src: ['assets/audios/error.mp3'] });
  audioHorizontal = new Howl({ src: ['assets/audios/horizontal.mp3'] }); // Nuevo sonido para horizontal

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
      if (gamma < -30) return 'izquierda'; // Ajusta el valor según la sensibilidad deseada
      else if (gamma > 30) return 'derecha';
    }
    
    if (Math.abs(beta) > 70) return 'vertical'; // Baja un poco el valor para detectar mejor la vertical
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
    Haptics.vibrate({ duration: 5000 });
  }

  stopAllSounds() {
    this.audioIzquierda.stop();
    this.audioDerecha.stop();
    this.audioVertical.stop();
    this.audioHorizontal.stop();
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
    this.audioError.play();
    Torch.enable();
    setTimeout(() => Torch.disable(), 5000);
  }

 
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {

    this.orientacionSubscription.remove(); // Limpia la suscripción al destruir el componente
    this.stopAllSounds();
  }
}
