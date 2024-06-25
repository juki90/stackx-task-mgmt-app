export const extractPayload: <T>(payload: string) => T = <T>(payload: string) =>
    JSON.parse(payload)?.result?.data?.json as T;

export const preparePayload: <T>(payload: T) => { json: T } = <T>(
    payload: T
) => ({ json: payload });

export const prepareQueryInput: <T>(payload: T) => string = <T>(payload: T) =>
    `?input=${payload ? encodeURIComponent(JSON.stringify({ json: payload })) : ''}`;
