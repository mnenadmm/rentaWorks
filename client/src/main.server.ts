import { platformServer } from '@angular/platform-server';
import { AppModule } from './app/app.module';

export const bootstrap = () => platformServer().bootstrapModule(AppModule);

export default bootstrap;
