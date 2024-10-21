import { Routes } from '@angular/router';
import { SplashPage } from './pages/login/splash/splash.page';


export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },

    {
      path: "",
      redirectTo: "splash",
      pathMatch: "full"
  },
  {
    path: "splash",
    component: SplashPage,
  },

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  }
];
