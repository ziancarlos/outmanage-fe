import React, { useEffect, useState } from 'react'
import {
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CBadge,
  CCol,
  CListGroup,
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
import TableLogShipment from '../../components/shipments/TableLogShipment'

const DetailShipment = () => {
  const { shipmentId } = useParams()

  const { authorizePermissions } = useAuth()

  const canReadItem = authorizePermissions.some((perm) => perm.name === 'read-item')
  const canReadFleet = authorizePermissions.some((perm) => perm.name === 'read-fleet')

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()

  const [shipment, setShipment] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetchShipment().finally(() => {
      setLoading(false)
    })
  }, [])

  async function fetchShipment() {
    try {
      const response = await axiosPrivate.get(`/api/shipments/${shipmentId}`)

      setShipment(response.data.data)
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
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <DetailCardLayout title={`S${shipment.shipmentId}`} className="mb-3">
            <CListGroupItem>
              Plat Nomor:{' '}
              {!!shipment.licensePlate ? (
                shipment.licensePlate
              ) : !!shipment.fleet?.fleetId ? (
                canReadFleet ? (
                  <NavLink to={`/fleets/${shipment.fleet.fleetId}/detail`}>
                    {shipment.fleet.licensePlate}
                  </NavLink>
                ) : (
                  shipment.fleet.licensePlate
                )
              ) : (
                '-'
              )}
            </CListGroupItem>
            <CListGroupItem>
              Catatan Internal: {shipment.internalNotes || 'Tidak ditemukkan catatan internal.'}
            </CListGroupItem>
            <CListGroupItem>
              <CBadge
                color={
                  shipment.shipmentType === 'JEMPUT'
                    ? 'primary'
                    : shipment.shipmentType === 'ANTAR'
                      ? 'success'
                      : 'secondary'
                }
              >
                {shipment.shipmentType}
              </CBadge>
            </CListGroupItem>
            <CListGroupItem>
              <CBadge color={shipment.status === 'SELESAI' ? 'success' : 'warning'}>
                {shipment.status}
              </CBadge>
            </CListGroupItem>
          </DetailCardLayout>

          <CCol lg={12} className="mb-3">
            <CAccordion>
              {shipment.shipmentDeliveryOrder.map((sdo, index) => (
                <CAccordionItem key={index} itemKey={index + 1}>
                  <CAccordionHeader>
                    <CRow className="align-items-center justify-content-between">
                      <strong>
                        DO
                        {sdo.deliveryOrder.deliveryOrderId} | SDO{sdo.shipmentDeliveryOrderId} |{' '}
                        {sdo.deliveryOrder.customer.name}
                      </strong>
                    </CRow>
                  </CAccordionHeader>
                  <CAccordionBody>
                    <CListGroup flush>
                      <CListGroupItem>Tipe : {sdo.shipmentDeliveryOrderType}</CListGroupItem>
                      <CListGroupItem>
                        Alamat : {sdo.address || 'Alamat tidak dicantumkan.'}
                      </CListGroupItem>
                    </CListGroup>
                    <div className="table-responsive">
                      <CTable striped bordered responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Barang</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {sdo.shipmentDeliveryOrderItem.map((sdoi, index) => {
                            const item = canReadItem ? (
                              sdoi.item.itemId ? (
                                <NavLink to={`/items/${sdoi.item.itemId}/detail`}>
                                  {sdoi.item.name}
                                </NavLink>
                              ) : (
                                '-'
                              )
                            ) : sdoi.item.itemId ? (
                              sdoi.item.name
                            ) : (
                              '-'
                            )

                            return (
                              <CTableRow key={index}>
                                <CTableDataCell>
                                  SDOI{sdoi.shipmentDeliveryOrderItemId}
                                </CTableDataCell>
                                <CTableDataCell>{item}</CTableDataCell>
                                <CTableDataCell>
                                  {Number(sdoi.quantity).toLocaleString()}
                                </CTableDataCell>
                              </CTableRow>
                            )
                          })}
                        </CTableBody>
                      </CTable>
                    </div>
                  </CAccordionBody>
                </CAccordionItem>
              ))}
            </CAccordion>
          </CCol>

          <TableLogShipment
            shipmentId={shipmentId}
            size={10}
            authorizePermissions={authorizePermissions}
          />
        </CRow>
      )}
    </>
  )
}

export default DetailShipment
