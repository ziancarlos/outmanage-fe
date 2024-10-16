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

import { useNavigate, useParams } from 'react-router-dom'

import moment from 'moment'
import useLogout from '../../hooks/useLogout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import TableClientLog from '../../components/clients/TableClientLog'
import useAuth from '../../hooks/useAuth'
import TableProject from '../../components/projects/TableProject'
import { formatToISODate } from '../../utils/DateUtils'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]

const matchingTypes = typeOptions.filter((option) => option.value).map((option) => option.value)

const DetailClient = () => {
  const { authorizePermissions } = useAuth()
  const canReadClientLogs = authorizePermissions.some((perm) => perm.name === 'read-client-logs')
  const canReadProjects = authorizePermissions.some((perm) => perm.name === 'read-projects')

  const { clientId } = useParams()

  const logout = useLogout()

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [client, setClient] = useState({})
  const [clientLogs, setClientLogs] = useState([])

  const [clientLogsPage, setClientLogsPage] = useState(1)
  const [setClientLogsTotalPages, setClienLogsTotalPages] = useState(1)
  const [clientLogsSearchTypeValue, setClientLogsSearchTypeValue] = useState('')
  const [clientLogsSearchStartDateValue, setClientLogsSearchStartDateValue] = useState('')
  const [clientLogsSearchEndDateValue, setClientLogsSearchEndDateValue] = useState('')
  const [clientLogsSearchLoading, setClientLogsSearchLoading] = useState(false)
  const [clientLogsError, setClientLogsError] = useState('')
  const clientSearchParamsRef = useRef()

  const [projectsError, setProjectsError] = useState('')
  const [projectsSearchValue, setProjectsSearchValue] = useState('')
  const [projectsSearchLoading, setProjectsSearchLoading] = useState(false)
  const [projectsPage, setProjectsPage] = useState(1)
  const [projectsTotalPages, setProjectsTotalPages] = useState(1)
  const projectSearchParamsRef = useRef()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setClientLogsError('')
  }, [clientLogsSearchTypeValue, clientLogsSearchStartDateValue, clientLogsSearchEndDateValue])

  useEffect(() => {
    setLoading(true)

    const fetchPromises = [fetchClient(clientId)]

    const searchParams = new URLSearchParams(location.search)

    if (canReadClientLogs) {
      const clientLogParam = searchParams.get('clientLog')

      if (!!clientLogParam) {
        try {
          const parsedParams = JSON.parse(clientLogParam)
          clientSearchParamsRef.current = {}

          if (matchingTypes.includes(parsedParams.type)) {
            clientSearchParamsRef.current.type = parsedParams.type
          }
          if (parsedParams.startDate) {
            clientSearchParamsRef.current.startDate = parsedParams.startDate
          }
          if (parsedParams.endDate) {
            clientSearchParamsRef.current.endDate = parsedParams.endDate
          }
        } finally {
          clearClientLogsSearchInput()
        }
      }

      fetchPromises.push(fetchClientLogs(clientId, clientLogsPage, clientSearchParamsRef.current))
    }

    if (canReadProjects) {
      const projectsSearchParam = searchParams.get('search')

      const trimmedSearchValue = projectsSearchParam ? projectsSearchParam.trim() : ''

      if (!!trimmedSearchValue) {
        projectSearchParamsRef.current = projectsSearchParam
      }

      fetchPromises.push(fetchProjects(clientId, projectsPage, projectsSearchParam))
    }

    Promise.all(fetchPromises).finally(() => setLoading(false))
  }, [])

  function clientLogHandleSearch(e) {
    e.preventDefault()
    setClientLogsSearchLoading(true)
    setClientLogsPage(1)

    const searchParams = {}

    if (matchingTypes.includes(clientLogsSearchTypeValue)) {
      searchParams.type = clientLogsSearchTypeValue
    }

    if (clientLogsSearchStartDateValue) {
      searchParams.startDate = formatToISODate(clientLogsSearchStartDateValue)
    }

    if (clientLogsSearchEndDateValue) {
      searchParams.endDate = formatToISODate(clientLogsSearchEndDateValue)
    }

    clientSearchParamsRef.current = searchParams

    const newParams = new URLSearchParams(location.search)

    if (Object.keys(searchParams).length > 0) {
      newParams.set('clientLog', JSON.stringify(searchParams))
    } else {
      newParams.delete('clientLog')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    fetchClientLogs(clientId, 1, clientSearchParamsRef.current).finally(() =>
      setClientLogsSearchLoading(false),
    )
  }

  function projectsHandleSearch(e) {
    e.preventDefault()
    setProjectsSearchLoading(true)
    setProjectsPage(1)

    const newParams = new URLSearchParams(location.search)

    projectSearchParamsRef.current = null

    const trimmedSearchValue = projectsSearchValue ? projectsSearchValue.trim() : ''

    if (!!trimmedSearchValue) {
      projectSearchParamsRef.current = projectsSearchValue

      newParams.set('search', projectSearchParamsRef.current)
    } else {
      newParams.delete('search')
    }

    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true })

    fetchProjects(clientId, 1, projectSearchParamsRef.current).finally(() =>
      setProjectsSearchLoading(false),
    )
  }

  function clearClientLogsSearchInput() {
    setClientLogsSearchTypeValue('')
    setClientLogsSearchStartDateValue('')
    setClientLogsSearchEndDateValue('')
  }

  async function fetchClient(clientId) {
    try {
      const response = await axiosPrivate.get(`/api/clients/${clientId}`)

      setClient(response.data.data)
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

  async function fetchClientLogs(clientId, page, searchParams = {}) {
    try {
      console.log(searchParams)
      const response = await axiosPrivate.get(`/api/clients/${clientId}/logs`, {
        params: { page, size: 3, ...searchParams },
      })

      setClientLogs(response.data.data)
      setClienLogsTotalPages(response.data.paging.totalPage)
      setClientLogsPage(response.data.paging.page)

      clearClientLogsSearchInput()
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setClientLogsError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchProjects(clientId, page, value = null) {
    try {
      const params = !!value
        ? { name: value, clientId, page: page, size: 5 }
        : { clientId, page: page, size: 5 }

      const response = await axiosPrivate.get('/api/projects', { params })

      setProjects(response.data.data)
      setProjectsTotalPages(response.data.paging.totalPage)
      setProjectsPage(response.data.paging.page)

      setProjectsSearchValue('')
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401 || e.response?.status === 404) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setProjectsError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  function clientLogHandlePageChange(newPage) {
    if (newPage >= 1 && newPage <= setClientLogsTotalPages && newPage !== clientLogsPage) {
      setClientLogsPage(newPage)

      setClientLogsSearchLoading(true)

      fetchClientLogs(clientId, newPage, clientSearchParamsRef.current).finally(() =>
        setClientLogsSearchLoading(false),
      )
    }
  }

  function projectsHandlePageChange(newPage) {
    if (newPage >= 1 && newPage <= projectsTotalPages && newPage !== projectsPage) {
      setProjectsPage(newPage)

      setProjectsSearchLoading(true)

      fetchProjects(clientId, newPage, projectSearchParamsRef.current).finally(() =>
        setProjectsSearchLoading(false),
      )
    }
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <CCol md={12} xs={12} className="mb-4">
            <CCard>
              <CCardBody>
                <CCardTitle>{'#' + client.clientId + ' ' + client.name}</CCardTitle>
              </CCardBody>
              <CListGroup flush>
                <CListGroupItem>No. Hp: {client.phoneNumber}</CListGroupItem>
                {!!client.email && <CListGroupItem>Email: {client.email}</CListGroupItem>}
                <CListGroupItem>Alamat: {client.address}</CListGroupItem>
                <CListGroupItem>
                  Dibuat Pada: {moment(client.createdAt).format('MMMM D, YYYY h:mm A')}
                </CListGroupItem>
              </CListGroup>
            </CCard>
          </CCol>

          {canReadProjects && (
            <CCol xs={12}>
              <TableProject
                error={projectsError}
                handleSearch={projectsHandleSearch}
                searchValue={projectsSearchValue}
                setSearchValue={setProjectsSearchValue}
                searchLoading={projectsSearchLoading}
                projects={projects}
                page={projectsPage}
                totalPages={projectsTotalPages}
                handlePageChange={projectsHandlePageChange}
                authorizePermissions={authorizePermissions}
              />
            </CCol>
          )}

          {canReadClientLogs && (
            <CCol xs={12}>
              <TableClientLog
                error={clientLogsError}
                handleSearch={clientLogHandleSearch}
                typeOptions={typeOptions}
                searchTypeValue={clientLogsSearchTypeValue}
                setSearchTypeValue={setClientLogsSearchTypeValue}
                searchStartDateValue={clientLogsSearchStartDateValue}
                setSearchStartDateValue={setClientLogsSearchStartDateValue}
                searchEndDateValue={clientLogsSearchEndDateValue}
                setSearchEndDateValue={setClientLogsSearchEndDateValue}
                searchLoading={clientLogsSearchLoading}
                clientsLogs={clientLogs}
                page={clientLogsPage}
                totalPages={setClientLogsTotalPages}
                handlePageChange={clientLogHandlePageChange}
                authorizePermissions={authorizePermissions}
              />
            </CCol>
          )}
        </CRow>
      )}
    </>
  )
}

export default DetailClient
