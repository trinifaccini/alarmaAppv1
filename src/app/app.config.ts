import { CUSTOM_ELEMENTS_SCHEMA, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, RouteReuseStrategy, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';


const firebaseConfig = {
  apiKey: "AIzaSyD9EjwtNE9XDa1QPL_iqCVVOCaEAmj1mxk",
  authDomain: "practica-profesional-faccini.firebaseapp.com",
  projectId: "practica-profesional-faccini",
  storageBucket: "practica-profesional-faccini.appspot.com",
  messagingSenderId: "1094929870630",
  appId: "1:1094929870630:web:3fff88f9b26b69e7435be7"
}

export const appConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withPreloading(PreloadAllModules)), 
    provideClientHydration(), 
    provideAnimationsAsync('noop'),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    //importProvidersFrom(IonicModule.forRoot()), // Proveer HttpClientModule
    provideIonicAngular(),
    provideAnimationsAsync('noop'), 
  ],
  provide: RouteReuseStrategy, useClass: IonicRouteStrategy,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

};


