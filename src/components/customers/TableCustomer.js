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

function TableCustomer({
  title = 'Data Kustomer',
  authorizePermissions,
  endpoint = '/api/customers',
  ...props
}) {
  const canReadCustomer = authorizePermissions.some((perm) => perm.name === 'read-customer')
  const canUpdateCustomer = authorizePermissions.some((perm) => perm.name === 'update-customer')

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [customers, setCustomers] = useState([])

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
    const queryParams = searchParams.get('customers')

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

    fethCustomers(filterRef.current).finally(() => {
      setLoading(false)
    })
  }, [refetch])

  useEffect(() => {
    setError('')
  }, [searchValue])

  async function fethCustomers() {
    try {
      const params = {
        page: filterRef.current.page,
        size: 10,
        ...(filterRef.current.searchValue && {
          name: filterRef.current.searchValue,
          initials: filterRef.current.searchValue,
        }),
      }

      const response = await axiosPrivate.get(endpoint, { params })

      setCustomers(response.data.data)
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
      newParams.set('customers', JSON.stringify(filterRef.current))
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
      newParams.set('customers', JSON.stringify(filterRef.current))
    } else {
      newParams.delete('customers')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    setRefetch((val) => !val)

    clearSearchInput()
  }

  function handleDetail(customerId) {
    navigate(`/customers/${customerId}/detail`)
  }

  function handleUpdate(customerId) {
    navigate(`/customers/${customerId}/edit`)
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
                    <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Inisial</CTableHeaderCell>
                    {(canReadCustomer || canUpdateCustomer) && (
                      <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {customers.map((customer) => {
                    const actionButtons = (
                      <>
                        {canReadCustomer && (
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => handleDetail(customer.customerId)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </CButton>
                        )}
                        {canUpdateCustomer && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleUpdate(customer.customerId)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                      </>
                    )

                    return (
                      <CTableRow key={customer.customerId}>
                        <CTableDataCell>C{customer.customerId}</CTableDataCell>
                        <CTableDataCell>{customer.name}</CTableDataCell>
                        <CTableDataCell>{customer.initials}</CTableDataCell>
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

export default TableCustomer
