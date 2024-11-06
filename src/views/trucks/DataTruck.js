import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CLoadingButton,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'

import { useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'

import useAuth from '../../hooks/useAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faEye, faSearch } from '@fortawesome/free-solid-svg-icons'

const DataProject = () => {
  const { authorizePermissions } = useAuth()

  const canUpdateTruck = authorizePermissions.some((perm) => perm.name === 'update-truck')
  const canReadTruck = authorizePermissions.some((perm) => perm.name === 'read-truck')

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  const [trucks, setTrucks] = useState([])

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

    console.log(searchValue)
    fetchData(searchValue).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setError('')
  }, [searchValue])

  async function fetchData(value = null) {
    try {
      const params = value ? { licensePlate: value, model: value } : {}

      const response = await axiosPrivate.get('/api/trucks', { params })

      setTrucks(response.data.data)
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

  async function handleSearch(e) {
    e.preventDefault()
    setSearchLoading(true)
    searchValueRef.current = null

    const trimmedSearchValue = searchValue ? searchValue.trim() : ''

    if (!!trimmedSearchValue) {
      searchValueRef.current = searchValue

      const newParams = new URLSearchParams({ search: searchValue })

      navigate(`/trucks/data?${newParams.toString()}`, { replace: true })
    } else {
      navigate(`/trucks/data`, { replace: true })
    }

    fetchData(searchValueRef.current).finally(() => setSearchLoading(false))
  }

  function handleUpdate(truckId) {
    navigate(`/trucks/${truckId}/edit`)
  }

  function handleDetail(truckId) {
    navigate(`/trucks/${truckId}/detail`)
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
                <strong>Data Proyek</strong>
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
                        disabled={searchLoading}
                        onChange={(e) => setSearchValue(e.target.value)}
                        aria-label="Search"
                      />
                    </CCol>

                    <CCol md={4} xs={12} className="d-flex align-items-center">
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
                        <CTableHeaderCell scope="col">Id Truk</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Model</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Plat Nomor</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Merek</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Warna</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {trucks.map((truck, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>#{truck.truckId}</CTableDataCell>
                          <CTableDataCell>{truck.model}</CTableDataCell>
                          <CTableDataCell>{truck.licensePlate}</CTableDataCell>
                          <CTableDataCell>{truck.brand.name}</CTableDataCell>
                          <CTableDataCell>
                            <div
                              style={{
                                backgroundColor: truck.color.rgb,
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                display: 'inline-block',
                              }}
                            ></div>
                            <span className="ms-2">{truck.color.name}</span>
                          </CTableDataCell>

                          <CTableDataCell>
                            {canReadTruck ? (
                              <CButton
                                color="info"
                                size="sm"
                                onClick={() => handleDetail(project.projectId)}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </CButton>
                            ) : (
                              ''
                            )}
                            {canReadTruck && canUpdateTruck ? (
                              <CButton
                                color="warning"
                                size="sm"
                                onClick={() => handleUpdate(truck.truckId)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </CButton>
                            ) : (
                              '-'
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default DataProject
