import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CSpinner, CCol, CRow } from '@coreui/react-pro'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import FormCreateUser from '../../components/users/FormCreateUser'
import TableUser from '../../components/users/TableUser'
import Swal from 'sweetalert2'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'

function ManageUser() {
  const { authorizePermissions } = useAuth()
  const canCreateUser = authorizePermissions.some((perm) => perm.name === 'create-user')
  const canReadRoles = authorizePermissions.some((perm) => perm.name === 'read-roles')

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)

  const [showRemoved, setShowRemoved] = useState(false)

  const [searchValue, setSearchValue] = useState('')
  const filterRef = useRef('')

  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    // get the query params
    const queryParams = new URLSearchParams(location.search)

    // get the query params of search
    filterRef.current = queryParams.get('search')

    const showRemovedParam = queryParams.get('showRemoved') === 'true'
    setShowRemoved(showRemovedParam)

    const fetchPromises = [
      fetchUser(page, filterRef.current, showRemovedParam ? '/api/users/removed' : '/api/users'),
    ]

    if (canReadRoles) {
      fetchPromises.push(fetchRole())
    }
    Promise.all(fetchPromises).finally(() => {
      setLoading(false)
    })
  }, [location.search, page])

  useEffect(() => {
    setError('')
  }, [searchValue])

  async function fetchUser(page, value = null, endpoint) {
    try {
      const params = !!value
        ? { username: value, email: value, telegramChatId: value, page: page, size: 5 }
        : { page: page, size: 5 }

      const response = await axiosPrivate.get(endpoint, { params })

      setUsers(response.data.data)
      setTotalPages(response.data.paging.totalPage ? response.data.paging.totalPage : 1)
      setPage(response.data.paging.page)
    } catch (e) {
      console.log(e)
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

  async function fetchRole() {
    try {
      const response = await axiosPrivate.get('/api/roles')

      setRoles(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)

      setLoading(true)

      fetchUser(
        newPage,
        filterRef.current,
        showRemoved ? '/api/users/removed' : '/api/users',
      ).finally(() => setLoading(false))
    }
  }

  function toggleRemoved() {
    setShowRemoved((prev) => !prev)

    setPage(1)

    const newParams = new URLSearchParams(location.search)

    // delete search every toggleRemoved()
    newParams.delete('search')
    filterRef.current = ''
    setSearchValue('')

    if (showRemoved) {
      newParams.delete('showRemoved')
    } else {
      newParams.set('showRemoved', 'true')
    }

    navigate(`/users?${newParams.toString()}`, { replace: true })
  }

  function handleUpdate(userId) {
    navigate(`/users/${userId}/edit`)
  }

  async function handleDelete(userId) {
    try {
      await axiosPrivate.delete(`/api/users/${userId}`)

      setLoading(true)

      fetchUser(page, null, showRemoved ? '/api/users/removed' : '/api/users').finally(() =>
        setLoading(false),
      )

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna berhasil dihapus.',
        confirmButtonText: 'OK',
      })
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 400].includes(e.response?.status)) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: e.response.data.data,
          confirmButtonText: 'OK',
        })
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function handleRestore(userId) {
    try {
      await axiosPrivate.post(`/api/users/restore/${userId}`)

      setLoading(true)

      fetchUser(page, null, showRemoved ? '/api/users/removed' : '/api/users').finally(() =>
        setLoading(false),
      )

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna berhasil dikembalikan.',
        confirmButtonText: 'OK',
      })
    } catch (e) {
      console.log(e)
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 400].includes(e.response?.status)) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: e.response.data.data,
          confirmButtonText: 'OK',
        })
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function handleSearch(e) {
    e.preventDefault()

    setPage(1)

    const newParams = new URLSearchParams(location.search)

    filterRef.current = searchValue
    if (filterRef.current) {
      newParams.set('search', filterRef.current)
    } else {
      newParams.delete('search')
    }

    if (showRemoved) {
      newParams.set('showRemoved', 'true')
    }

    navigate(`/users?${newParams.toString()}`, { replace: true })

    setSearchValue('')
  }

  function handleDetail(userId) {
    navigate(`/users/${userId}/detail`)
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          {canCreateUser && canReadRoles && (
            <CCol md={8} sm={7} xs={12}>
              <FormCreateUser
                roles={roles}
                fetchData={() =>
                  Promise.all([
                    fetchUser(
                      page,
                      filterRef.current,
                      showRemoved ? '/api/users/removed' : '/api/users',
                    ),
                    fetchRole(),
                  ])
                }
              />
            </CCol>
          )}

          <CCol xs={12} className="mt-3">
            <TableUser
              users={users}
              handleUpdate={handleUpdate}
              handlePageChange={handlePageChange}
              page={page}
              totalPages={totalPages}
              handleDelete={handleDelete}
              toggleRemoved={toggleRemoved}
              showRemoved={showRemoved}
              handleRestore={handleRestore}
              handleDetail={handleDetail}
              handleSearch={handleSearch}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              loading={loading}
              error={error}
              authorizePermissions={authorizePermissions}
            />
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default ManageUser
