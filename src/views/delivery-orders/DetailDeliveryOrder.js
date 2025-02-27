import React, { useEffect, useState } from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CListGroupItem,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'

import { NavLink, useNavigate, useParams } from 'react-router-dom'

import { DetailCardLayout } from '../../components/DetailCardLayout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import TableLogDeliveryOrder from '../../components/delivery-orders/TableLogDeliveryOrder'

const DetailDeliveryOrder = () => {
  const { deliveryOrderId } = useParams()

  const { authorizePermissions } = useAuth()

  const canReadItem = authorizePermissions.some((perm) => perm.name === 'read-item')
  const canReadCustomer = authorizePermissions.some((perm) => perm.name === 'read-customer')

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()

  const [deliveryOrder, setDeliveryOrder] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetchDeliveryOrder().finally(() => {
      setLoading(false)
    })
  }, [])

  async function fetchDeliveryOrder() {
    try {
      const response = await axiosPrivate.get(`/api/delivery-orders/${deliveryOrderId}`)

      setDeliveryOrder(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([404, 401, 400].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  return (
    <>
      <CRow>
        {loading ? (
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        ) : (
          <>
            <DetailCardLayout title={`DO${deliveryOrder.deliveryOrderId}`} className="mb-3">
              <CListGroupItem>
                Kustomer:{' '}
                {canReadCustomer ? (
                  <NavLink to={`/customers/${deliveryOrder.customer.customerId}/detail`}>
                    {deliveryOrder.customer.name}
                  </NavLink>
                ) : (
                  deliveryOrder.customer.name
                )}
              </CListGroupItem>
              <CListGroupItem>
                Alamat: {deliveryOrder.address || 'Tidak ditemukkan catatan internal.'}
              </CListGroupItem>
              <CListGroupItem>
                Catatan Internal:{' '}
                {deliveryOrder.internalNotes || 'Tidak ditemukkan catatan internal.'}
              </CListGroupItem>
              <CListGroupItem>
                <CBadge
                  color={
                    deliveryOrder.status === 'SELESAI'
                      ? 'success'
                      : deliveryOrder.status === 'PROSES'
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {deliveryOrder.status}
                </CBadge>
              </CListGroupItem>
            </DetailCardLayout>

            <CCol xs={12} className="mb-3">
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>{'Data Kuantitas'}</strong>
                </CCardHeader>
                <CCardBody>
                  <CCol xs={12}>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Kuantitas Dipesan</CTableHeaderCell>
                            <CTableDataCell>
                              <CBadge color="danger">{`Kuantitas Pending`}</CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color="warning">{`Kuantitas Diproses`}</CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color="success">{`Kuantitas Selesai`}</CBadge>
                            </CTableDataCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {deliveryOrder.deliveryOrderItems.map((doi, index) => {
                            const item = canReadItem ? (
                              doi.item.itemId ? (
                                <NavLink to={`/items/${doi.item.itemId}/detail`}>
                                  {doi.item.name}
                                </NavLink>
                              ) : (
                                '-'
                              )
                            ) : doi.item.itemId ? (
                              doi.item.name
                            ) : (
                              '-'
                            )
                            return (
                              <CTableRow key={index}>
                                <CTableDataCell>DOI{doi.deliveryOrderItemId}</CTableDataCell>
                                <CTableDataCell>{item}</CTableDataCell>
                                <CTableDataCell>
                                  {Number(doi.orderedQuantity).toLocaleString()}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {Number(doi.pendingQuantity).toLocaleString()}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {Number(doi.processQuantity).toLocaleString()}
                                </CTableDataCell>
                                <CTableDataCell>
                                  {Number(doi.completedQuantity).toLocaleString()}
                                </CTableDataCell>
                              </CTableRow>
                            )
                          })}
                        </CTableBody>
                      </CTable>
                    </div>
                  </CCol>
                </CCardBody>
              </CCard>
            </CCol>

            {/* <CCol xs={12} className="mb-3">
              <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <strong>{'Data Pengiriman'}</strong>
                </CCardHeader>
                <CCardBody>
                  <div className="table-responsive">
                    <CTable striped bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Pengiriman</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {deliveryOrder.shipmentDeliveryOrder.map((sdo, index) => {
                            return (
                            <CTableRow key={index}>
                              <CTableDataCell>SDO{sdo.shipmentDeliveryOrderId}</CTableDataCell>
                              <CTableDataCell>S{sdo.shipment.shipmentId}</CTableDataCell>
                              <CTableDataCell>
                                {!!doi.shipment.loadGoodsPicture ? (
                                  <CBadge color="success">{`Selesai`}</CBadge>
                                ) : (
                                  <CBadge color="info">{`Diproses`}</CBadge>
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>
                  </div>
                </CCardBody>
              </CCard>
            </CCol> */}

            <TableLogDeliveryOrder
              deliveryOrderId={deliveryOrderId}
              xs={12}
              authorizePermissions={authorizePermissions}
              size={5}
            />
          </>
        )}
      </CRow>
    </>
  )
}

export default DetailDeliveryOrder
