import axios from 'axios'

const publicAxios = axios.create({
  // baseURL: 'http://116.193.191.63:1500',
  baseURL: 'http://localhost:1500',
})

export const privateAxios = axios.create({
  // baseURL: 'http://116.193.191.63:1500',
  baseURL: 'http://localhost:1500',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export default publicAxios
