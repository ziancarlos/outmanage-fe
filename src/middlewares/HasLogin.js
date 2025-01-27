import React, { useState, useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import useRefreshToken from '../hooks/useRefreshToken'
import useAuth from '../hooks/useAuth'
import { CSpinner } from '@coreui/react-pro'
import useLogout from '../hooks/useLogout'

function HasLogin() {
  const { currentUser, persist, setCurrentUser } = useAuth()
  const refresh = useRefreshToken()
  const logout = useLogout()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyRefreshToken = async () => {
      if (persist && !currentUser?.accessToken) {
        try {
          await refresh()
        } catch (e) {
          console.log(e)
          if (e.response?.status === 400 && e.config.url === '/api/auth/refresh') {
            await logout().catch((e) => {
              setCurrentUser({})
            })
          }
        }
      }

      setLoading(false)
    }

    verifyRefreshToken()
  }, [])

  if (loading) return <CSpinner color="primary" />

  if (currentUser?.accessToken) {
    return <Navigate to={'/dashboard'} />
  }

  // Render the child routes if the user is not redirected
  return <Outlet />
}

export default HasLogin
