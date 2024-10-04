import { Navigate, Outlet } from 'react-router-dom'
import React from 'react'
import useAuth from '../hooks/useAuth'
import Swal from 'sweetalert2'

function Authenticate() {
  const { currentUser } = useAuth()

  if (!currentUser?.accessToken) {
    Swal.fire({
      icon: 'error',
      title: 'Unauthorize!',
      text: 'You need to login before accessing this page.',
      confirmButtonText: 'OK',
    })

    return <Navigate to={'/login'} />
  }

  return <Outlet />
}

export default Authenticate
