import React, { useEffect, useState } from 'react'
import { CListGroupItem, CRow, CSpinner } from '@coreui/react-pro'

import { useNavigate, useParams } from 'react-router-dom'

import { DetailCardLayout } from '../../components/DetailCardLayout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import TableLogFleet from '../../components/fleets/TableLogFleet'

export default function DetailFleet() {
  const { fleetId } = useParams()
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()

  const [fleet, setFleets] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetchFleet().finally(() => {
      setLoading(false)
    })
  }, [])

  async function fetchFleet() {
    try {
      const response = await axiosPrivate.get(`/api/fleets/${fleetId}`)

      setFleets(response.data.data)
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
            <DetailCardLayout title={`F${fleet.fleetId}`} className="mb-3">
              <CListGroupItem>Model: {fleet.model}</CListGroupItem>
              <CListGroupItem>Nomor Polisi: {fleet.licensePlate}</CListGroupItem>
            </DetailCardLayout>

            <TableLogFleet
              xs={12}
              size={3}
              authorizePermissions={authorizePermissions}
              fleetId={fleet.fleetId}
            />
          </>
        )}
      </CRow>
    </>
  )
}
