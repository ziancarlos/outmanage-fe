import React, { useEffect, useState } from 'react'
import { CListGroupItem, CRow, CSpinner } from '@coreui/react-pro'

import { useNavigate, useParams } from 'react-router-dom'

import { DetailCardLayout } from '../../components/DetailCardLayout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'

import TableLogCustomer from '../../components/customers/TableLogCustomer'

const DetailCustomer = () => {
  const { customerId } = useParams()
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetchCustomer().finally(() => {
      setLoading(false)
    })
  }, [])

  async function fetchCustomer() {
    try {
      const response = await axiosPrivate.get(`/api/customers/${customerId}`)

      console.log(response.data.data)
      setCustomer(response.data.data)
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
            <DetailCardLayout title={`C${customer.customerId}`} className="mb-3">
              <CListGroupItem>Nama: {customer.name}</CListGroupItem>
              <CListGroupItem>Inisial: {customer.initials}</CListGroupItem>
            </DetailCardLayout>

            <TableLogCustomer
              xs={12}
              size={3}
              authorizePermissions={authorizePermissions}
              customerId={customer.customerId}
            />
          </>
        )}
      </CRow>
    </>
  )
}

export default DetailCustomer
