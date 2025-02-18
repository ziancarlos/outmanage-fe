import React, { useEffect, useState } from 'react'
import { CBadge, CListGroupItem, CRow, CSpinner } from '@coreui/react-pro'

import { NavLink, useNavigate, useParams } from 'react-router-dom'

import { DetailCardLayout } from '../../components/DetailCardLayout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import TableLogActivityUser from '../../components/users/TableLogAcitivityUser'
import TableLogUser from '../../components/users/TableLogUser'

const DetailUser = () => {
  const { userId } = useParams()
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()

  const canReadPermissionWithRelated = authorizePermissions.some(
    (perm) => perm.name === 'read-permissions-with-related',
  )

  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetchUser().finally(() => {
      setLoading(false)
    })
  }, [])

  async function fetchUser() {
    try {
      const response = await axiosPrivate.get(`/api/users/${userId}`)

      setUser(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 400].includes(e.response?.status)) {
        setError(e.response?.data.error)
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  return (
    <>
      <CRow>
        {loading ? (
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        ) : (
          <>
            <DetailCardLayout title={`U${user.userId}`} className="mb-3">
              <CListGroupItem>Username: {user.username}</CListGroupItem>
              <CListGroupItem>
                Peran:{' '}
                {canReadPermissionWithRelated ? (
                  <NavLink to={`/roles/${user.role.roleId}/permissions`}>{user.role.name}</NavLink>
                ) : (
                  user.role.name
                )}
              </CListGroupItem>
              <CListGroupItem>
                {user.deletedAt === null ? (
                  <CBadge color="success">Aktif</CBadge>
                ) : (
                  <CBadge color="danger">Nonaktif</CBadge>
                )}
              </CListGroupItem>
            </DetailCardLayout>

            <TableLogActivityUser
              className="mb-3"
              xs={12}
              size={5}
              authorizePermissions={authorizePermissions}
              userId={user.userId}
            />

            <TableLogUser
              xs={12}
              size={3}
              authorizePermissions={authorizePermissions}
              userId={user.userId}
            />
          </>
        )}
      </CRow>
    </>
  )
}

export default DetailUser
