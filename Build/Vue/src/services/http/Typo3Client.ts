import axios from 'axios';

// base client for HTTP requests

const client = axios.create(
    {
        // use development server for now
        baseURL: 'http://localhost:8080/api/',
        timeout: 1000,
        headers: {},
    },
);

export default client;
