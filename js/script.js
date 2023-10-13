import { App } from './app/app.js';

console.time();

const app = new App();
app.init();

console.timeEnd();
