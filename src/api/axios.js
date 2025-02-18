import axios from 'axios'

const publicAxios = axios.create({
  // baseURL: 'https://test.outmanage.online',
  baseURL: 'http://localhost:1500',
})

export const privateAxios = axios.create({
  // baseURL: 'https://test.outmanage.online',
  baseURL: 'http://localhost:1500',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export default publicAxios
