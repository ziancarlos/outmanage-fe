import React, { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import useRefreshToken from '../hooks/useRefreshToken'
import { Outlet, useNavigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react-pro'
import useLogout from '../hooks/useLogout'

function PersistLogin() {
  const { persist, currentUser } = useAuth()
  const refresh = useRefreshToken()
  const logout = useLogout()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const verifyRefreshToken = async () => {
      try {
        await refresh()
      } catch (e) {
        if (e.response?.status === 400 && e.config.url === '/api/auth/refresh') {
          await logout().finally(() => {
            setLoading(false)
          })
        } else {
          navigate('/500')
        }
      } finally {
        isMounted && setLoading(false)
      }
    }

    if (!currentUser?.accessToken && persist) {
      verifyRefreshToken()
    } else {
      setLoading(false)
    }

    // if (!currentUser?.accessToken && persist) {
    //   setLoading(true)
    //   verifyRefreshToken()
    // }

    return () => (isMounted = false)
  }, [])

  return <>{!persist ? <Outlet /> : loading ? <CSpinner color="primary" /> : <Outlet />}</>
}

export default PersistLogin
