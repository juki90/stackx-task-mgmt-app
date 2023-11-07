export default (
    user: string,
    password: string,
    host: string,
    port: number,
    dbName: string,
    nodeEnv: string
): string =>
    `postgres://${user}:${encodeURIComponent(
        password
    )}@${host}:${port}/${dbName}?${
        nodeEnv === 'prod' ? 'sslmode=require' : ''
    }`;
