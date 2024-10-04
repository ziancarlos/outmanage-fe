import { useEffect } from 'react'

import useRefreshToken from './useRefreshToken'
import useAuth from './useAuth'
import { privateAxios } from '../api/axios'

function useAxiosPrivate() {
  const { setCurrentUser, currentUser } = useAuth()
  const refresh = useRefreshToken()

  useEffect(() => {
    const requestInterceptor = privateAxios.interceptors.request.use((config) => {
      if (!config.headers.Authorization) {
        const accessToken = currentUser.accessToken

        config.headers.Authorization = `Bearer ${accessToken}`
      }

      return config
    })

    const responseInterceptor = privateAxios.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        const config = error.config

        if (error.response && error.response.status === 401 && !config._retry) {
          config._retry = true

          const newAccessToken = await refresh()

          config.headers.Authorization = `Bearer ${newAccessToken}`

          return privateAxios(config)
        }

        return Promise.reject(error)
      },
    )

    return () => {
      privateAxios.interceptors.request.eject(requestInterceptor)
      privateAxios.interceptors.response.eject(responseInterceptor)
    }
  }, [currentUser])

  return privateAxios
}

export default useAxiosPrivate
