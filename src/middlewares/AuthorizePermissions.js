import { Outlet, useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useAuth from '../hooks/useAuth'
import { CSpinner } from '@coreui/react-pro'
import useLogout from '../hooks/useLogout'

const AuthorizePermissions = () => {
  const { setAuthorizePermissions } = useAuth()
  const [loading, setLoading] = useState(true)
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const logout = useLogout()

  useEffect(() => {
    const fetchPermissions = async () => {
      const response = await axiosPrivate.get(`/api/roles/my/permissions`)
      setAuthorizePermissions(response.data.data)
    }

    fetchPermissions()
      .catch(async (e) => {
        if (e.response?.status === 400 && e.config.url === '/api/auth/refresh') {
          await logout().finally(() => {
            setLoading(false)
          })
        } else if (e.code === 'ERR_NETWORK') {
          navigate('/500')
        } else if (e.response?.status === 401 || e.response?.status === 404) {
          await logout()

          navigate('/login')
        } else {
          navigate('/500')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <CSpinner color="primary" />
  }

  return <Outlet />
}

export default AuthorizePermissions
