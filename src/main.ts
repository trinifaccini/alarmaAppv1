// import { bootstrapApplication } from '@angular/platform-browser';
// import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
// import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

// import { routes } from './app/app.routes';
// import { AppComponent } from './app/app.component';
// import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { getAuth, provideAuth } from '@angular/fire/auth';



// bootstrapApplication(AppComponent, {
//   providers: [
//     { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
//     provideIonicAngular(),
//     provideRouter(routes, withPreloading(PreloadAllModules)), 
//     provideFirebaseApp(() => initializeApp({"projectId":"app-clase1","appId":"1:212682578316:web:4d179570f3ed90fa17dea9","storageBucket":"app-clase1.appspot.com","apiKey":"AIzaSyCrhp-KyTcXFwmM7nVWF-OqiJD3eL3koo8","authDomain":"app-clase1.firebaseapp.com","messagingSenderId":"212682578316","measurementId":"G-F6T7QYYR2F"})), 
//     provideAuth(() => getAuth()),
//   ],
// });


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

