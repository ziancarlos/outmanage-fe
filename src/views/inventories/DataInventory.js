import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CLoadingButton,
  CPagination,
  CPaginationItem,
  CRow,
  CSmartPagination,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLocation, useNavigate } from 'react-router-dom'
import { faEye, faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'

const DataInventory = () => {
  const { authorizePermissions } = useAuth()
  const canReadInventory = authorizePermissions.some((perm) => perm.name === 'read-inventory')
  const canReadInventoryLogs = authorizePermissions.some(
    (perm) => perm.name === 'read-inventory-logs',
  )

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  const [inventories, setInventories] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [searchValue, setSearchValue] = useState('')

  const searchValueRef = useRef()

  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const searchValue = queryParams.get('search')

    fetchData(page, searchValue).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setError('')
  }, [searchValue])

  async function fetchData(page, value = null) {
    try {
      const params = !!value
        ? { name: value, email: value, address: value, phoneNumber: value, page: page, size: 5 }
        : { page: page, size: 5 }

      const response = await axiosPrivate.get('/api/inventories', { params })

      setInventories(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
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

  function handleDetail(inventoryId) {
    navigate(`/inventories/${inventoryId}/detail`)
  }

  async function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    setPage(1)

    searchValueRef.current = searchValue

    setSearchValue('')

    if (searchValue) {
      const newParams = new URLSearchParams({ search: searchValue })

      navigate(`/inventories/data?${newParams.toString()}`, { replace: true })
    } else {
      navigate(`/inventories/data`, { replace: true })
    }

    fetchData(1, searchValue).finally(() => setSearchLoading(false))
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
            <CCard className="mb-4">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Data Inventaris</strong>
              </CCardHeader>
              <CCardBody>
                {error && (
                  <CRow className="mb-3">
                    <CCol>
                      <CAlert color="danger">{error}</CAlert>
                    </CCol>
                  </CRow>
                )}

                <CForm onSubmit={handleSearch} noValidate>
                  <CRow className="mb-3">
                    <CCol md={8} xs={12}>
                      <CFormInput
                        type="text"
                        placeholder="Cari..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        aria-label="Search"
                      />
                    </CCol>

                    <CCol md={4} xs={12} className="d-flex align-items-center mt-2 mt-md-0">
                      <CLoadingButton
                        color="primary"
                        type="submit"
                        loading={searchLoading}
                        disabled={searchLoading}
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </CLoadingButton>
                    </CCol>
                  </CRow>
                </CForm>

                <div className="table-responsive">
                  <CTable striped bordered responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Id Inventaris</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Kondisi</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                        {canReadInventory || canReadInventoryLogs ? (
                          <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                        ) : (
                          ''
                        )}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {inventories.map((inventory, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>#{inventory.inventoryId}</CTableDataCell>
                          <CTableDataCell>{inventory.name}</CTableDataCell>
                          <CTableDataCell>
                            {inventory.condition === 0 ? (
                              <CBadge color="primary">BARU</CBadge>
                            ) : inventory.condition === 1 ? (
                              <CBadge color="warning">BEKAS</CBadge>
                            ) : (
                              <span>{inventory.condition}</span> // Fallback for any other condition
                            )}
                          </CTableDataCell>
                          <CTableDataCell>{inventory.quantity.toLocaleString()}</CTableDataCell>
                          <CTableDataCell>
                            {canReadInventory || canReadInventoryLogs ? (
                              <CButton
                                color="info"
                                size="sm"
                                onClick={() => handleDetail(inventory.inventoryId)}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </CButton>
                            ) : (
                              ''
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>

                <CSmartPagination
                  size="sm"
                  activePage={page}
                  pages={totalPages} // Set the total number of pages
                  onActivePageChange={handlePageChange} // Handle page change
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default DataInventory
