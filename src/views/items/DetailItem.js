import React, { useEffect, useState } from 'react'
import { CListGroupItem, CRow, CSpinner } from '@coreui/react-pro'

import { useNavigate, useParams } from 'react-router-dom'

import { DetailCardLayout } from '../../components/DetailCardLayout'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import useAuth from '../../hooks/useAuth'
import TableLogItem from '../../components/items/TableLogItem'

export default function DetailItem() {
  const { itemId } = useParams()
  const { authorizePermissions } = useAuth()

  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()

  const [item, setItem] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    fetchItem().finally(() => {
      setLoading(false)
    })
  }, [])

  async function fetchItem() {
    try {
      const response = await axiosPrivate.get(`/api/items/${itemId}`)

      setItem(response.data.data)
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
            <DetailCardLayout title={`I${item.itemId}`} className="mb-3">
              <CListGroupItem>Nama: {item.name}</CListGroupItem>
              <CListGroupItem>Sku: {item.stockKeepingUnit}</CListGroupItem>
            </DetailCardLayout>

            <TableLogItem
              xs={12}
              size={3}
              authorizePermissions={authorizePermissions}
              itemId={item.itemId}
            />
          </>
        )}
      </CRow>
    </>
  )
}
