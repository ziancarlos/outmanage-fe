import axios from 'axios'

const publicAxios = axios.create({
  baseURL: 'http://localhost:300',
})

export const privateAxios = axios.create({
  baseURL: 'http://localhost:300',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export default publicAxios
