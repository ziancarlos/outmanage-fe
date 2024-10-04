import { privateAxios } from '../api/axios'
import useAuth from './useAuth'

const useLogout = () => {
  const { currentUser, setCurrentUser, setAuthorizePermissions } = useAuth()

  const logout = async () => {
    try {
      await privateAxios.delete('/api/auth/logout', {
        headers: `Bearer ${currentUser?.accessToken}`,
      })
    } finally {
      setCurrentUser({})

      setAuthorizePermissions([])
    }
  }

  return logout
}

export default useLogout
