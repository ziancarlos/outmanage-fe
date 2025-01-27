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

export default function TableItem({
  title = 'Data Barang',
  authorizePermissions,
  endpoint = '/api/items',
  ...props
}) {
  const canReadItem = authorizePermissions.some((perm) => perm.name === 'read-item')
  const canUpdateItem = authorizePermissions.some((perm) => perm.name === 'update-item')

  const location = useLocation()
  const logout = useLogout()
  const navigate = useNavigate()
  const axiosPrivate = useAxiosPrivate()

  const [items, setItems] = useState([])

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
    const queryParams = searchParams.get('items')

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

    fethItems(filterRef.current).finally(() => {
      setLoading(false)
    })
  }, [refetch])

  useEffect(() => {
    setError('')
  }, [searchValue])

  async function fethItems() {
    try {
      const params = {
        page: filterRef.current.page,
        size: 10,
        ...(filterRef.current.searchValue && {
          name: filterRef.current.searchValue,
          stockKeepingUnit: filterRef.current.searchValue,
        }),
      }

      const response = await axiosPrivate.get(endpoint, { params })

      setItems(response.data.data)
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
      newParams.set('items', JSON.stringify(filterRef.current))
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
      newParams.set('items', JSON.stringify(filterRef.current))
    } else {
      newParams.delete('items')
    }

    navigate(`${location.pathname}?${newParams}`, { replace: true })

    setRefetch((val) => !val)

    clearSearchInput()
  }

  function handleDetail(itemId) {
    navigate(`/items/${itemId}/detail`)
  }

  function handleUpdate(itemId) {
    navigate(`/items/${itemId}/edit`)
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
                    <CTableHeaderCell scope="col">SKU</CTableHeaderCell>
                    {(canReadItem || canUpdateItem) && (
                      <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {items.map((item) => {
                    const actionButtons = (
                      <>
                        {canReadItem && (
                          <CButton color="info" size="sm" onClick={() => handleDetail(item.itemId)}>
                            <FontAwesomeIcon icon={faEye} />
                          </CButton>
                        )}
                        {canUpdateItem && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleUpdate(item.itemId)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                      </>
                    )

                    return (
                      <CTableRow key={item.itemId}>
                        <CTableDataCell>I{item.itemId}</CTableDataCell>
                        <CTableDataCell>{item.name}</CTableDataCell>
                        <CTableDataCell>{item.stockKeepingUnit}</CTableDataCell>
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
