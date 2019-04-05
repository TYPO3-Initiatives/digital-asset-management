import axios from 'axios';

// base client for HTTP requests

const client = axios.create(
    {
        timeout: 5000,
        headers: {},
    },
);

export default client;
