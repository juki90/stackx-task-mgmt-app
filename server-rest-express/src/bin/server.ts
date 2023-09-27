import 'reflect-metadata';
import createApp from '@/index';
import { envConfig } from '@/config';
import { en as messages } from '@/locales';

const {
    app: { port }
} = envConfig;

(async () => {
    const app = await createApp();

    app.listen(port, () => {
        console.info(`${messages.serverStartedOnPort} ${port}`);
    });
})();
