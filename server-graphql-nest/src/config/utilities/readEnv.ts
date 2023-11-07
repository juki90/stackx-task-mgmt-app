export default (envName: string, defaultValue = ''): string =>
    process.env[envName] || defaultValue;
