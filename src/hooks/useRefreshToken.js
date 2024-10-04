import { privateAxios } from '../api/axios'
import useAuth from './useAuth'

function useRefreshToken() {
  const { setCurrentUser } = useAuth()

  async function refresh() {
    const response = await privateAxios.post('/api/auth/refresh')

    setCurrentUser({
      userId: response.data.data.userId,
      username: response.data.data.username,
      accessToken: response.data.data.accessToken,
      roleId: response.data.data.roleId,
    })

    return response.data.data.accessToken
  }

  return refresh
}

export default useRefreshToken
