import axios from 'axios';

// base client for HTTP requests

const client = axios.create(
    {
        timeout: 1000,
        headers: {},
    },
);

export default client;
