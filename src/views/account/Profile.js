import React, { useEffect, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CCardLink,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react-pro'

import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import moment from 'moment'

import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import TableUserLog from '../../components/users/TableUserLog'
import useAuth from '../../hooks/useAuth'

const Profile = () => {
  const { authorizePermissions } = useAuth()

  const canrReadPermissionWithRelatedByRoleId = authorizePermissions.some(
    (perm) => perm.name === 'read-permissions-with-related-by-role-id',
  )

  const navigate = useNavigate()
  const location = useLocation()

  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()

  const [user, setUser] = useState(null)
  const [activities, setActivities] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const [error, setError] = useState('')

  const [searchActivityValue, setSearchActivityValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')

  const searchParamsRef = useRef()

  const activityOptions = [
    { label: 'Pilih Aktifitas', value: '' },
    { label: 'Login Berhasil', value: 'login_berhasil' },
    { label: 'Login Gagal', value: 'login_gagal' },
  ]

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const searchActivityParamValue = queryParams.get('activity')
    const startDateParamValue = queryParams.get('startDate')
    const endDateParamValue = queryParams.get('endDate')

    searchParamsRef.current = {}

    if (searchActivityParamValue) {
      searchParamsRef.current.activity = searchActivityParamValue
    }
    if (startDateParamValue) {
      searchParamsRef.current.startDate = startDateParamValue
    }
    if (endDateParamValue) {
      searchParamsRef.current.endDate = endDateParamValue
    }

    fetchData(1, searchParamsRef.current).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setError('')
  }, [searchActivityValue, searchStartDateValue, searchEndDateValue])

  async function signOut() {
    await logout().finally(() => {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Berhasil Logout.',
        confirmButtonText: 'OK',
      })

      navigate('/login')
    })
  }

  async function fetchUser() {
    try {
      const response = await axiosPrivate.get('/api/users/my')

      setUser(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 400, 401].includes(e.response?.status)) {
        await logout()
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchActivities(page, searchParams) {
    try {
      const response = await axiosPrivate.get('/api/users/my/activities', {
        params: { page: page, size: 10, ...searchParams },
      })

      setActivities(response.data.data)
      setTotalPages(response.data.paging.totalPage ? response.data.paging.totalPage : 1)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 401].includes(e.response?.status)) {
        await logout()
      } else if (e.response?.status === 400) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchData(page, searchParams = {}) {
    return Promise.all([fetchUser(), fetchActivities(page, searchParams)])
  }

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)
      setPaginationLoading(true)
      fetchData(newPage, searchParamsRef.current).finally(() => setPaginationLoading(false))
    }
  }

  function handleSearch(e) {
    e.preventDefault()

    const searchParams = {}

    if (
      activityOptions[1].value === searchActivityValue ||
      activityOptions[2].value === searchActivityValue
    ) {
      searchParams.activity = searchActivityValue
    }

    if (searchStartDateValue) {
      searchParams.startDate = searchStartDateValue
    }

    if (searchEndDateValue) {
      searchParams.endDate = searchEndDateValue
    }

    searchParamsRef.current = searchParams

    setPage(1)

    setSearchLoading(true)

    fetchData(1, searchParams).finally(() => setSearchLoading(false))

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/profile`)
    }

    setSearchActivityValue('')
    setSearchStartDateValue('')
    setSearchEndDateValue('')
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <CCol>
            <CCard xl={2}>
              <CCardBody>
                <CCardTitle>{user.username}</CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>Alamat email: {user.email}</CListGroupItem>
                <CListGroupItem>
                  Peran:{' '}
                  {canrReadPermissionWithRelatedByRoleId ? (
                    <NavLink to={`/roles/${user.role.roleId}/permissions`}>
                      {user.role.name}
                    </NavLink>
                  ) : (
                    user.role.name
                  )}
                </CListGroupItem>

                {user.telegramChatId && (
                  <CListGroupItem>Telegram Chat Id: {user.telegramChatId}</CListGroupItem>
                )}
                <CListGroupItem>
                  Dibuat Pada: {moment(user.createdAt).format('MMMM D, YYYY h:mm A')}
                </CListGroupItem>
                <CListGroupItem>
                  Diubah Pada: {moment(user.updatedAt).format('MMMM D, YYYY h:mm A')}
                </CListGroupItem>
              </CListGroup>

              <CCardBody>
                <CCardLink as={NavLink} to="/settings">
                  Profile Settings
                </CCardLink>
                <CCardLink as={NavLink} onClick={signOut}>
                  Logout
                </CCardLink>
              </CCardBody>
            </CCard>
          </CCol>

          <TableUserLog
            error={error}
            handleSearch={handleSearch}
            activityOptions={activityOptions}
            searchActivityValue={searchActivityValue}
            setSearchActivityValue={setSearchActivityValue}
            searchStartDateValue={searchStartDateValue}
            setSearchStartDateValue={setSearchStartDateValue}
            searchEndDateValue={searchEndDateValue}
            setSearchEndDateValue={setSearchEndDateValue}
            searchLoading={searchLoading}
            activities={activities}
            page={page}
            totalPages={totalPages}
            paginationLoading={paginationLoading}
            handlePageChange={handlePageChange}
          />
        </CRow>
      )}
    </>
  )
}

export default Profile
