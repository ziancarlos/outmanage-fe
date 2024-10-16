import React, { useEffect, useRef, useState } from 'react'
import { CCol, CRow, CSpinner } from '@coreui/react-pro'

import { useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'

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

  const searchValueRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    const searchParams = new URLSearchParams(location.search)
    const searchValue = searchParams.get('search')

    const trimmedSearchValue = searchValue ? searchValue.trim() : ''

    if (!!trimmedSearchValue) {
      searchValueRef.current = searchValue
    }

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

      setSearchValue('')
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

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)

      setSearchLoading(true)

      fetchData(newPage, searchValueRef.current).finally(() => setSearchLoading(false))
    }
  }

  async function handleSearch(e) {
    e.preventDefault()
    setSearchLoading(true)
    setPage(1)

    searchValueRef.current = null

    const trimmedSearchValue = searchValue ? searchValue.trim() : ''

    if (!!trimmedSearchValue) {
      searchValueRef.current = searchValue

      const newParams = new URLSearchParams({ search: searchValue })

      navigate(`/projects/data?${newParams.toString()}`, { replace: true })
    } else {
      navigate(`/projects/data`, { replace: true })
    }

    fetchData(1, searchValueRef.current).finally(() => setSearchLoading(false))
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
