export default async () => {
    console.info('Clearing Postgres DB starts...');

    await typeOrmManager.query("SET SESSION_REPLICATION_ROLE = 'replica'");

    for (const entity of Object.values(entities)) {
        await typeOrmManager.getRepository(entity).delete({});
    }

    await typeOrmManager.query("SET SESSION_REPLICATION_ROLE = 'origin'");
};
