import axios from 'axios';

const instance = axios.create({
    baseURL:
        process.env.REACT_APP_SERVER_API_URL ||
        `${window.location.protocol}//${window.location.host}/api`
});

export default instance;
