import React, { useEffect, useRef, useState } from 'react'
import { CCol, CRow, CSpinner } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLocation, useNavigate } from 'react-router-dom'
import { faEye, faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import moment from 'moment'
import useAuth from '../../hooks/useAuth'
import TableProject from '../../components/projects/TableProject'

const DataProject = () => {
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  const [projects, setProjects] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [searchValue, setSearchValue] = useState('')

  const searchValueRef = useRef()

  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const searchValue = queryParams.get('search')

    searchValueRef.current = searchValue

    setLoading(true)

    fetchData(page, searchValue).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setError('')
  }, [searchValue])

  async function fetchData(page, value = null) {
    try {
      const params = !!value ? { name: value, page: page, size: 5 } : { page: page, size: 5 }

      const response = await axiosPrivate.get('/api/projects', { params })

      setProjects(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([404, 400].includes(e.response?.status)) {
        setError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)

      setLoading(true)

      fetchData(newPage, searchValueRef.current).finally(() => setLoading(false))
    }
  }

  async function handleSearch(e) {
    e.preventDefault()

    setPage(1)

    setSearchLoading(true)

    fetchData(1, searchValue).finally(() => setSearchLoading(false))

    if (searchValue) {
      const newParams = new URLSearchParams({ search: searchValue })

      navigate(`/projects/data?${newParams.toString()}`, { replace: true })
    } else {
      navigate(`/projects/data`, { replace: true })
    }

    searchValueRef.current = searchValue

    setSearchValue('')
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <CCol xs={12}>
            <TableProject
              title={'Data Proyek'}
              error={error}
              handleSearch={handleSearch}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              searchLoading={searchLoading}
              projects={projects}
              page={page}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              authorizePermissions={authorizePermissions}
            />
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default DataProject
