import React, { useEffect, useRef, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CLoadingButton,
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

const DataSupplier = () => {
  const { authorizePermissions } = useAuth()
  const canUpdateSupplier = authorizePermissions.some((perm) => perm.name === 'update-supplier')
  const canReadSupplier = authorizePermissions.some((perm) => perm.name === 'read-supplier')
  const canReadSupplierLogs = authorizePermissions.some(
    (perm) => perm.name === 'read-supplier-logs',
  )

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  const [suppliers, setSuppliers] = useState([])

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [searchValue, setSearchValue] = useState('')

  const searchValueRef = useRef()

  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)

    const queryParams = new URLSearchParams(location.search)
    const searchValue = queryParams.get('search')

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
      const params = !!value
        ? { name: value, email: value, address: value, phoneNumber: value, page: page, size: 5 }
        : { page: page, size: 5 }

      const response = await axiosPrivate.get('/api/suppliers', { params })

      setSuppliers(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)

      setSearchValue('')
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

      setSearchLoading(true)

      fetchData(newPage, searchValueRef.current).finally(() => setSearchLoading(false))
    }
  }

  function handleDetail(supplierId) {
    navigate(`/suppliers/${supplierId}/detail`)
  }

  function handleUpdate(supplierId) {
    navigate(`/suppliers/${supplierId}/edit`)
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

      navigate(`/suppliers/data?${newParams.toString()}`, { replace: true })
    } else {
      navigate(`/suppliers/data`, { replace: true })
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
            <CCard className="mb-4">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Data Pemasok</strong>
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
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        aria-label="Search"
                      />
                    </CCol>

                    <CCol md={4} xs={12} className="d-flex align-items-center mt-2 mt-md-0">
                      <CLoadingButton
                        color="light"
                        type="submit"
                        loading={searchLoading}
                        disabled={searchLoading}
                      >
                        <FontAwesomeIcon icon={faSearch} className="me-2" />
                        Filter
                      </CLoadingButton>
                    </CCol>
                  </CRow>
                </CForm>

                <div className="table-responsive">
                  <CTable striped bordered responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                        <CTableHeaderCell scope="col">No. Hp</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Alamat</CTableHeaderCell>
                        {canReadSupplier || canReadSupplierLogs || canUpdateSupplier ? (
                          <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                        ) : (
                          ''
                        )}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {suppliers.map((supplier, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>S{supplier.supplierId}</CTableDataCell>
                          <CTableDataCell>{supplier.name}</CTableDataCell>
                          <CTableDataCell>{supplier.email || '-'}</CTableDataCell>
                          <CTableDataCell>{supplier.phoneNumber}</CTableDataCell>
                          <CTableDataCell>{supplier.address}</CTableDataCell>
                          <CTableDataCell>
                            {canReadSupplier || canReadSupplierLogs ? (
                              <CButton
                                color="info"
                                size="sm"
                                onClick={() => handleDetail(supplier.supplierId)}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </CButton>
                            ) : (
                              ''
                            )}

                            {canUpdateSupplier ? (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleUpdate(supplier.supplierId)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
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

export default DataSupplier
