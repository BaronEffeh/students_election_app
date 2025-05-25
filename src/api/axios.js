// src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://github.com/imchukwu/voting_system',
});

export default API;
