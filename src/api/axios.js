import axios from 'axios'

const publicAxios = axios.create({
  baseURL: 'http://127.0.0.1:300',
})

export const privateAxios = axios.create({
  baseURL: 'http://127.0.0.1:300',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export default publicAxios
