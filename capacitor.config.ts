import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.alarma',
  appName: 'Alarma',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // No oculta automáticamente el splash screen al inicio
      backgroundColor: "#ffffffff", // Color de fondo del splash screen
      androidScaleType: "CENTER_CROP", // Tipo de escalado en Android
      showSpinner: true, // Mostrar el spinner de carga
      androidSpinnerStyle: "large", // Estilo del spinner en Android
      iosSpinnerStyle: "small", // Estilo del spinner en iOS
      spinnerColor: "#999999", // Color del spinner
      splashFullScreen: true, // Pantalla completa en Android
      splashImmersive: true // Modo inmersivo en Android
    }
  }
};

export default config;
