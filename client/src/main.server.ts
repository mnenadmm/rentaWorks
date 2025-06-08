import { platformServer } from '@angular/platform-server';
import { AppModule } from './app/app.module';
import { AppServerModule } from './app/app.server.module';

export const bootstrap = () => platformServer().bootstrapModule(AppServerModule);

export default bootstrap;
