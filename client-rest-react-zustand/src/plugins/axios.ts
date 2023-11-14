import axios from 'axios';

const instance = axios.create({
    baseURL:
        process.env.REACT_APP_SERVER_API_URL ||
        `${window.location.protocol}//${window.location.host}/api`,
    withCredentials: true
});

instance.interceptors.response.use(response => {
    const jwtHeader = response?.headers?.['x-auth-token'];

    const tokenMatch = /Bearer (\S+)/g.exec(jwtHeader);

    if (!tokenMatch || tokenMatch.length < 1) {
        return response;
    }

    const [, token] = tokenMatch;

    if (token) {
        localStorage.setItem('access_token', token);
    }

    return response;
});

instance.interceptors.request.use(request => {
    const access_token = localStorage.getItem('access_token');

    if (!access_token) {
        return request;
    }

    const jwtHeader = `Bearer ${access_token}`;

    request.headers.Authorization = jwtHeader;

    return request;
});

export default instance;
