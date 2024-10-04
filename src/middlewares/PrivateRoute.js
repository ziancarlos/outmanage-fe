/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import useAuth from '../hooks/useAuth'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useLogout from '../hooks/useLogout'
import { CSpinner } from '@coreui/react-pro'

function PrivateRoute({ permissions }) {
  const { currentUser, authorizePermissions, setAuthorizePermissions } = useAuth()
  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  async function fetchPermissions() {
    const response = await axiosPrivate.get(`/api/roles/my/permissions`)

    setAuthorizePermissions(response.data.data)
  }
  useEffect(() => {
    if (currentUser?.roleId) {
      fetchPermissions()
        .then(async () => {
          if (authorizePermissions.length === 0) {
            await logout().finally(() => {
              setLoading(false)
            })
          }

          setLoading(false)
        })
        .catch(async (e) => {
          if (e.response?.status === 400 && e.config.url === '/api/auth/refresh') {
            await logout().finally(() => {
              setLoading(false)
            })
          }
          if (e.code === 'ERR_NETWORK') {
            navigate('/500')
          }

          if ([404, 401].includes(e.response?.status)) {
            await logout()

            navigate('/login')
          }

          if (e.response?.status === 500) {
            navigate('/500')
          }
        })
    } else {
      setLoading(false)
    }
  }, [location])

  if (loading) {
    return <CSpinner color="primary" />
  }

  if (authorizePermissions.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Unauthorize!',
      text: 'You need to login before accessing this page.',
      confirmButtonText: 'OK',
    })

    return <Navigate to="/login" replace />
  }

  const authorizedPermissionNames = authorizePermissions.map((permission) => permission.name)
  const requiredPermissionNames = permissions || []

  const hasRequiredPermissions = requiredPermissionNames.every((permission) =>
    authorizedPermissionNames.includes(permission),
  )

  if (!currentUser?.accessToken) {
    Swal.fire({
      icon: 'error',
      title: 'Unauthorize!',
      text: 'You need to login before accessing this page.',
      confirmButtonText: 'OK',
    })

    return <Navigate to="/login" replace />
  }

  if (!hasRequiredPermissions) {
    return <Navigate to="/404" replace />
  }

  return <Outlet />
}

export default PrivateRoute
