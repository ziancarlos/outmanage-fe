/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react'
import {
  CButton,
  CCol,
  CFormInput,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faEye, faUndo } from '@fortawesome/free-solid-svg-icons'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import Swal from 'sweetalert2'
import TableFilterLayout from '../TableFilterLayout'
import TableCardLayout from '../TableCardLayout'

function TableUser({
  title = 'Data Pengguna Aktif',
  authorizePermissions,
  endpoint = '/api/users',
  ...props
}) {
  const canReadUser = authorizePermissions.some((perm) => perm.name === 'read-user')
  const canRestoreUser = authorizePermissions.some((perm) => perm.name === 'restore-user')
  const canUpdateUser = authorizePermissions.some((perm) => perm.name === 'update-user')
  const canRemoveUser = authorizePermissions.some((perm) => perm.name === 'remove-user')
  const canReadRoles = authorizePermissions.some((perm) => perm.name === 'read-roles')
  const canrReadPermissionWithRelated = authorizePermissions.some(
    (perm) => perm.name === 'read-permissions-with-related',
  )

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [users, setUsers] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [searchValue, setSearchValue] = useState('')
  const [refetch, setRefetch] = useState(false)
  const filterRef = useRef({})

  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    const searchParams = new URLSearchParams(location.search)
    const queryParams = searchParams.get('users')

    let parsedParams = {}

    if (queryParams) {
      try {
        parsedParams = JSON.parse(queryParams)
      } catch (error) {
        navigate(`${location.pathname}`, { replace: true })
      }
    }

    if (parsedParams.searchValue) {
      filterRef.current.searchValue = parsedParams.searchValue // Correctly use the parsed value
    }

    filterRef.current.page = parseInt(parsedParams.page) || 1
    setPage(filterRef.current.page)

    fetchUser(filterRef.current).finally(() => {
      setLoading(false)
    })
  }, [refetch])

  useEffect(() => {
    setError('')
  }, [searchValue])

  async function fetchUser() {
    try {
      const params = {
        page: filterRef.current.page,
        size: 3,
        ...(filterRef.current.searchValue && { username: filterRef.current.searchValue }),
      }

      const response = await axiosPrivate.get(endpoint, { params })

      setUsers(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)
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

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      filterRef.current.page = newPage
      setPage(filterRef.current.page)

      const newParams = new URLSearchParams(location.search)
      newParams.set('users', JSON.stringify(filterRef.current))
      navigate(`${location.pathname}?${newParams}`, { replace: true })

      setRefetch((val) => !val)
    }
  }

  async function handleDelete(userId) {
    try {
      await axiosPrivate.delete(`/api/users/${userId}`)

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna berhasil dihapus.',
        confirmButtonText: 'OK',
      })

      setRefetch((val) => !val)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 404].includes(e.response?.status)) {
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

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengguna berhasil diaktifkan.',
        confirmButtonText: 'OK',
      })

      setRefetch((val) => !val)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 404].includes(e.response?.status)) {
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

    filterRef.current = {}

    filterRef.current.page = 1

    if (searchValue) {
      filterRef.current.searchValue = searchValue
    }

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(filterRef.current).length > 0) {
      newParams.set('users', JSON.stringify(filterRef.current))
    } else {
      newParams.delete('users')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    setRefetch((val) => !val)

    clearSearchInput()
  }

  function handleDetail(userId) {
    navigate(`/users/${userId}/detail`)
  }

  function handleUpdate(userId) {
    navigate(`/users/${userId}/edit`)
  }

  function clearSearchInput() {
    setSearchValue('')
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CCol {...props}>
          <TableCardLayout
            title={title}
            error={error}
            page={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          >
            <TableFilterLayout handleSearch={handleSearch} loading={loading}>
              <CCol md={8} xs={12}>
                <CFormInput
                  type="text"
                  placeholder="Cari..."
                  value={searchValue}
                  disabled={loading}
                  onChange={(e) => setSearchValue(e.target.value)}
                  aria-label="Search"
                />
              </CCol>
            </TableFilterLayout>

            <div className="table-responsive">
              <CTable striped bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Username</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Peran</CTableHeaderCell>
                    {(canReadUser ||
                      canRestoreUser ||
                      (canUpdateUser && canReadRoles) ||
                      canRemoveUser) && <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((user) => {
                    const roleName = canrReadPermissionWithRelated ? (
                      <NavLink to={`/roles/${user.role.roleId}/detail`}>{user.role.name}</NavLink>
                    ) : (
                      user.role.name
                    )

                    const actionButtons = (
                      <>
                        {canReadUser && (
                          <CButton color="info" size="sm" onClick={() => handleDetail(user.userId)}>
                            <FontAwesomeIcon icon={faEye} />
                          </CButton>
                        )}
                        {canUpdateUser && canReadRoles && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleUpdate(user.userId)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                        {user.deletedAt === null && canRemoveUser && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(user.userId)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}

                        {user.deletedAt !== null && canRestoreUser && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRestore(user.userId)}
                          >
                            <FontAwesomeIcon icon={faUndo} />
                          </button>
                        )}
                      </>
                    )

                    return (
                      <CTableRow key={user.userId}>
                        <CTableDataCell>U{user.userId}</CTableDataCell>
                        <CTableDataCell>{user.username}</CTableDataCell>
                        <CTableDataCell>{roleName}</CTableDataCell>
                        <CTableDataCell>{actionButtons}</CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
          </TableCardLayout>
        </CCol>
      )}
    </>
  )
}

export default TableUser
