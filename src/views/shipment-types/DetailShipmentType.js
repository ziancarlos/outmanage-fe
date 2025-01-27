import React, { useEffect, useState } from 'react'
import { CListGroupItem, CRow, CSpinner } from '@coreui/react-pro'

import { useNavigate, useParams } from 'react-router-dom'

import { DetailCardLayout } from '../../components/DetailCardLayout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import TableLogShipmentType from '../../components/shipment-types/TableLogShipmentType'

const DetailCustomer = () => {
  const { shipmentTypeId } = useParams()
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()

  const [shipmentType, setShipmentType] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetchShipmentType().finally(() => {
      setLoading(false)
    })
  }, [])

  async function fetchShipmentType() {
    try {
      const response = await axiosPrivate.get(`/api/shipment-types/${shipmentTypeId}`)

      setShipmentType(response.data.data)
    } catch (e) {
      console.log(e)
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
            <DetailCardLayout title={`C${shipmentType.shipmentTypeId}`} className="mb-3">
              <CListGroupItem>Nama: {shipmentType.name}</CListGroupItem>
            </DetailCardLayout>

            <TableLogShipmentType
              xs={12}
              size={3}
              authorizePermissions={authorizePermissions}
              shipmentTypeId={shipmentType.shipmentTypeId}
            />
          </>
        )}
      </CRow>
    </>
  )
}

export default DetailCustomer
