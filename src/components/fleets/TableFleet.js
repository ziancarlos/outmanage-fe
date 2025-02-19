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

export default function TableFleet({
  title = 'Data Armada',
  authorizePermissions,
  endpoint = '/api/fleets',
  ...props
}) {
  const canReadFleet = authorizePermissions.some((perm) => perm.name === 'read-fleet')
  const canUpdateFleet = authorizePermissions.some((perm) => perm.name === 'update-fleet')

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [fleets, setFleets] = useState([])

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
    const queryParams = searchParams.get('fleets')

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

    fethFleets(filterRef.current).finally(() => {
      setLoading(false)
    })
  }, [refetch])

  useEffect(() => {
    setError('')
  }, [searchValue])

  async function fethFleets() {
    try {
      const params = {
        page: filterRef.current.page,
        size: 10,
        ...(filterRef.current.searchValue && {
          model: filterRef.current.searchValue,
          licensePlate: filterRef.current.searchValue,
        }),
      }

      const response = await axiosPrivate.get(endpoint, { params })

      setFleets(response.data.data)
      setTotalPages(response.data.paging.totalPage)
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

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      filterRef.current.page = newPage
      setPage(filterRef.current.page)

      const newParams = new URLSearchParams(location.search)
      newParams.set('fleets', JSON.stringify(filterRef.current))
      navigate(`${location.pathname}?${newParams}`, { replace: true })

      setRefetch((val) => !val)
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
      newParams.set('fleets', JSON.stringify(filterRef.current))
    } else {
      newParams.delete('fleets')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    setRefetch((val) => !val)

    clearSearchInput()
  }

  function handleDetail(fleetId) {
    navigate(`/fleets/${fleetId}/detail`)
  }

  function handleUpdate(fleetId) {
    navigate(`/fleets/${fleetId}/edit`)
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
                    <CTableHeaderCell scope="col">Model</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nomor Polisi</CTableHeaderCell>
                    {(canReadFleet || canUpdateFleet) && (
                      <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {fleets.map((fleet) => {
                    const actionButtons = (
                      <>
                        {canReadFleet && (
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => handleDetail(fleet.fleetId)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </CButton>
                        )}
                        {canUpdateFleet && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleUpdate(fleet.fleetId)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                      </>
                    )

                    return (
                      <CTableRow key={fleet.fleetId}>
                        <CTableDataCell>F{fleet.fleetId}</CTableDataCell>
                        <CTableDataCell>{fleet.model}</CTableDataCell>
                        <CTableDataCell>{fleet.licensePlate}</CTableDataCell>
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
