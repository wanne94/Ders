// Polyfills for React Native environment
import 'react-native-url-polyfill/auto';

// FormData polyfill for file uploads
if (typeof global.FormData === 'undefined') {
  global.FormData = class FormData {
    constructor() {
      this._data = [];
    }

    append(key, value, filename) {
      this._data.push({ key, value, filename });
    }

    getParts() {
      return this._data;
    }
  };
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
