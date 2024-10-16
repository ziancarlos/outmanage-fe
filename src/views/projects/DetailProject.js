import React, { useEffect, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CRow,
  CCol,
} from '@coreui/react-pro'

import { NavLink, useNavigate, useParams } from 'react-router-dom'

import moment from 'moment'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'
import { formatToISODate } from '../../utils/DateUtils'
import TableProjectLog from '../../components/projects/TableProjectLog'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]
const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const DetailProject = () => {
  const { authorizePermissions } = useAuth()
  const canReadProjectLogs = authorizePermissions.some((perm) => perm.name === 'read-project-logs')
  const canReadClient = authorizePermissions.some((perm) => perm.name === 'read-client')

  const { projectId } = useParams()

  const logout = useLogout()

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [project, setProject] = useState({})
  const [projectLogs, setProjectLogs] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [error, setError] = useState('')

  const [searchTypeValue, setSearchTypeValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const searchParamsRef = useRef()

  useEffect(() => {
    setError('')
  }, [searchTypeValue, searchStartDateValue, searchEndDateValue])

  useEffect(() => {
    setLoading(true)

    const fetchPromises = [fetchProject(projectId)]

    if (canReadProjectLogs) {
      const queryParams = new URLSearchParams(location.search)
      const searchActivityParamValue = queryParams.get('type')
      const startDateParamValue = queryParams.get('startDate')
      const endDateParamValue = queryParams.get('endDate')

      searchParamsRef.current = {}

      if (matchingTypes.includes(searchActivityParamValue)) {
        searchParamsRef.current.type = searchActivityParamValue
      }
      if (startDateParamValue) {
        searchParamsRef.current.startDate = startDateParamValue
      }
      if (endDateParamValue) {
        searchParamsRef.current.endDate = endDateParamValue
      }

      fetchPromises.push(fetchProjectLogs(projectId, page, searchParamsRef.current))
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [])

  function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    setPage(1)

    const searchParams = {}

    if (matchingTypes.includes(searchTypeValue)) {
      searchParams.type = searchTypeValue
    }

    if (searchStartDateValue) {
      searchParams.startDate = formatToISODate(searchStartDateValue)
    }

    if (searchEndDateValue) {
      searchParams.endDate = formatToISODate(searchEndDateValue)
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/projects/${projectId}/detail`)
    }

    fetchProjectLogs(projectId, 1, searchParamsRef.current).finally(() => setSearchLoading(false))
  }

  async function fetchProject(projectId) {
    try {
      const response = await axiosPrivate.get(`/api/projects/${projectId}`)

      setProject(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchProjectLogs(projectId, page, searchParams) {
    try {
      const response = await axiosPrivate.get(`/api/projects/${projectId}/logs`, {
        params: { page: page, size: 3, ...searchParams },
      })

      setProjectLogs(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)

      clearInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)

      setSearchLoading(true)

      fetchProjectLogs(projectId, newPage, searchParamsRef).finally(() => setSearchLoading(false))
    }
  }

  function clearInput() {
    setSearchTypeValue('')
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
          <CCol md={12} xs={12}>
            <CCard>
              <CCardBody>
                <CCardTitle>{'#' + project.projectId + ' ' + project.name}</CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>
                  Klien:{' '}
                  {canReadClient ? (
                    <NavLink to={`/clients/${project.client.clientId}/detail`}>
                      {project.client.name}
                    </NavLink>
                  ) : (
                    project.client.name
                  )}
                </CListGroupItem>
                <CListGroupItem>Address: {project.address}</CListGroupItem>
                {project.description && (
                  <CListGroupItem>Deskripsi: {project.description}</CListGroupItem>
                )}
                <CListGroupItem>
                  Dibuat Pada: {moment(project.createdAt).format('MMMM D, YYYY h:mm A')}
                </CListGroupItem>
              </CListGroup>
            </CCard>
          </CCol>

          {canReadProjectLogs && (
            <CCol className="mt-3" md={12} xs={12}>
              <TableProjectLog
                error={error}
                handleSearch={handleSearch}
                typeOptions={typeOptions}
                searchTypeValue={searchTypeValue}
                setSearchTypeValue={setSearchTypeValue}
                searchStartDateValue={searchStartDateValue}
                setSearchStartDateValue={setSearchStartDateValue}
                searchEndDateValue={searchEndDateValue}
                setSearchEndDateValue={setSearchEndDateValue}
                searchLoading={searchLoading}
                projectsLogs={projectLogs}
                page={page}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                authorizePermissions={authorizePermissions}
              />
            </CCol>
          )}
        </CRow>
      )}
    </>
  )
}

export default DetailProject
