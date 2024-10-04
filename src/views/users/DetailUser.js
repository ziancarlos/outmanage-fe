import React, { useEffect, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner,
} from '@coreui/react-pro'

import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'

import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'

import TableUserLog from '../../components/users/TableUserLog'
import moment from 'moment'
import { formatToISODate } from '../../utils/DateUtils'

const DetailUser = () => {
  const { userId } = useParams()

  const navigate = useNavigate()
  const location = useLocation()

  const { authorizePermissions } = useAuth()
  const canReadUsersActivities = authorizePermissions.some(
    (perm) => perm.name === 'read-users-activities',
  )
  const canrReadPermissionWithRelatedByRoleId = authorizePermissions.some(
    (perm) => perm.name === 'read-permissions-with-related-by-role-id',
  )

  const logout = useLogout()
  const axiosPrivate = useAxiosPrivate()

  const [user, setUser] = useState(null)
  const [activities, setActivities] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  const [error, setError] = useState('')

  const [searchActivityValue, setSearchActivityValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')

  const searchParamsRef = useRef()

  const activityOptions = [
    { label: 'Select an activity', value: '' },
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
  }, [location.search])

  useEffect(() => {
    setError('')
  }, [searchActivityValue, searchStartDateValue, searchEndDateValue])

  async function fetchUser(userId) {
    try {
      const response = await axiosPrivate.get(`/api/users/${userId}`)

      setUser(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 400, 401].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchActivities(userId, page, searchParams) {
    try {
      const response = await axiosPrivate.get('/api/users/activities', {
        params: { userId: userId, page: page, size: 10, ...searchParams },
      })

      setActivities(response.data.data)
      setTotalPages(response.data.paging.totalPage ? response.data.paging.totalPage : 1)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 401].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchData(page, fetchActivitiesSearchParams = {}) {
    return canReadUsersActivities
      ? Promise.all([fetchUser(userId), fetchActivities(userId, page, fetchActivitiesSearchParams)])
      : Promise.all([fetchUser(userId)])
  }

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)
      setLoading(true)
      fetchData(newPage, searchParamsRef.current).finally(() => setLoading(false))
    }
  }

  function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    setPage(1)

    const searchParams = {}
    if (
      activityOptions[1].value === searchActivityValue ||
      activityOptions[2].value === searchActivityValue
    ) {
      searchParams.activity = searchActivityValue
    }

    if (searchStartDateValue) {
      searchParams.startDate = formatToISODate(searchStartDateValue)
    }

    if (searchEndDateValue) {
      searchParams.endDate = formatToISODate(searchEndDateValue)
    }

    searchParamsRef.current = searchParams

    setSearchActivityValue('')
    setSearchStartDateValue('')
    setSearchEndDateValue('')

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/users/${userId}/detail`)
    }

    fetchData(1, searchParams).finally(() => setSearchLoading(false))
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <>
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

                  <CListGroupItem>
                    Dibuat Pada: {moment(user.createdAt).format('MMMM D, YYYY h:mm A')}
                  </CListGroupItem>
                  <CListGroupItem>
                    Diubah Pada: {moment(user.updatedAt).format('MMMM D, YYYY h:mm A')}
                  </CListGroupItem>
                </CListGroup>
              </CCard>
            </CCol>

            {canReadUsersActivities && (
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
                handlePageChange={handlePageChange}
              />
            )}
          </CRow>
        </>
      )}
    </>
  )
}

export default DetailUser
