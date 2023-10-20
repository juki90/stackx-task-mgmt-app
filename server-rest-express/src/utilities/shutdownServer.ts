import type { Server } from 'http';
import type { Express } from 'express';

export default async (httpServer: Server & { app?: Express }) => {
    const di = httpServer.app.get('di');
    const logger = di.get('services.logger');
    const sequelize = di.get('services.sequelize');

    logger.info('Shutting down Postgres DB connection...');

    await sequelize.close();

    logger.info('Shutting down API Server...');

    httpServer.close();
};
