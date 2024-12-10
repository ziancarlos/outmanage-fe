import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  CAvatar,
  CButton,
  CCard,
  CCardBody,
  CCardSubtitle,
  CCardTitle,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CLink,
  CProgress,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsA,
  CWidgetStatsF,
} from '@coreui/react-pro'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import {
  cilArrowRight,
  cilDollar,
  cilFactory,
  cilPeople,
  cilStorage,
  cilUser,
  cilTask,
  cilIndustry,
  cilCart,
  cilCreditCard,
} from '@coreui/icons'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useLogout from '../../hooks/useLogout'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { formatRupiah } from '../../utils/CurrencyUtils'

const Dashboard = () => {
  const { t } = useTranslation()
  const axiosPrivate = useAxiosPrivate()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)

  const [dashboard, setDashboard] = useState([])

  async function fetchData(page) {
    try {
      const response = await axiosPrivate.get('/api/dashboard')

      console.log(response.data.data.transactionSale)
      setDashboard(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else {
        navigate('/500')
      }
    }
  }

  useEffect(() => {
    setLoading(true)

    fetchData().finally(() => {
      setLoading(false)
    })
  }, [])

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <CRow>
          <CCol xl={12}>
            <CRow>
              <CCol sm={3}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Klien')}
                      </CCardTitle>
                      <div className="bg-primary bg-opacity-25 text-primary rounded p-2 ms-2">
                        {/* Icon representing clients */}
                        <CIcon icon={cilUser} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {dashboard?.client?.count.toLocaleString()}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={3}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Proyek')}
                      </CCardTitle>
                      <div className="bg-success bg-opacity-25 text-success rounded p-2 ms-2">
                        {/* Icon representing projects */}
                        <CIcon icon={cilTask} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {dashboard?.project?.count.toLocaleString()}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={3}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Pemasok')}
                      </CCardTitle>
                      <div className="bg-warning bg-opacity-25 text-warning rounded p-2 ms-2">
                        {/* Icon representing suppliers */}
                        <CIcon icon={cilIndustry} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {dashboard?.supplier?.count.toLocaleString()}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={3}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Inventaris')}
                      </CCardTitle>
                      <div className="bg-info bg-opacity-25 text-info rounded p-2 ms-2">
                        {/* Icon representing inventory */}
                        <CIcon icon={cilStorage} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {dashboard?.inventory?.count.toLocaleString()}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={6}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Jumlah penyewaan aktif')}
                      </CCardTitle>
                      <div className="bg-primary bg-opacity-25 text-primary rounded p-2 ms-2">
                        <CIcon icon={cilTask} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {dashboard?.transactionRent?.numberActiveRent.toLocaleString()}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={6}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Total pendapatan dari penyewaan aktif')}
                      </CCardTitle>
                      <div className="bg-primary bg-opacity-25 text-primary rounded p-2 ms-2">
                        <CIcon icon={cilDollar} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {formatRupiah(dashboard?.transactionRent?.totalRevenueActiveRent)}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={4}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Total nilai pembelian bulan ini')}
                      </CCardTitle>
                      <div className="bg-info bg-opacity-25 text-info rounded p-2 ms-2">
                        <CIcon icon={cilDollar} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {formatRupiah(dashboard?.purchase?.purchaseValueThisMonth)}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={4}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Jumlah transaksi pembelian')}
                      </CCardTitle>
                      <div className="bg-warning bg-opacity-25 text-warning rounded p-2 ms-2">
                        <CIcon icon={cilCart} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {dashboard?.purchase?.numberOfPurchase.toLocaleString()}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={4}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Total hutang pembelian')}
                      </CCardTitle>
                      <div className="bg-danger bg-opacity-25 text-danger rounded p-2 ms-2">
                        <CIcon icon={cilCreditCard} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {formatRupiah(dashboard?.purchase?.purchaseDebt)}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={6}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Total nilai penjualan bulan ini')}
                      </CCardTitle>
                      <div className="bg-info bg-opacity-25 text-info rounded p-2 ms-2">
                        <CIcon icon={cilDollar} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {formatRupiah(dashboard?.transactionSale?.saleValueThisMonth)}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={6}>
                <CWidgetStatsF
                  className="mb-4"
                  color="info" // Set color to 'info' for sales-related data
                  footer={
                    <NavLink
                      className="font-weight-bold font-xs text-body-secondary"
                      to={`/inventories/${dashboard?.transactionSale?.itemMostSold?.inventoryId}/detail`} // Updated link
                      rel="noopener noreferrer"
                    >
                      View more
                      <CIcon icon={cilArrowRight} className="float-end" width={16} />
                    </NavLink>
                  }
                  icon={<CIcon icon={cilStorage} height={24} />} // Use an icon related to sales or items
                  title={t('Barang yang paling banyak terjual')}
                  value={
                    dashboard?.transactionSale?.itemMostSold === null
                      ? '-'
                      : `${dashboard?.transactionSale?.itemMostSold?.name} | ${dashboard?.transactionSale?.itemMostSold?.condition === 0 ? 'BARU' : 'BEKAS'}`
                  }
                />
              </CCol>

              <CCol sm={6}>
                <CCard className="mb-4">
                  <CCardBody>
                    <div className="d-flex justify-content-between">
                      <CCardTitle as="h6" className="text-body-secondary text-truncate">
                        {t('Total biaya operasional bulan ini')}
                      </CCardTitle>
                      <div className="bg-danger bg-opacity-25 text-danger rounded p-2 ms-2">
                        <CIcon icon={cilDollar} size="xl" />
                      </div>
                    </div>
                    <div className="fs-4 fw-semibold pb-3">
                      {formatRupiah(
                        dashboard?.operationalExpense?.operationalExpenseValueThisMonth,
                      )}
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol sm={6}>
                <CWidgetStatsF
                  className="mb-4"
                  color="danger" // Set color to 'danger' for expense-related data
                  footer={
                    <NavLink
                      className="font-weight-bold font-xs text-body-secondary"
                      to={`/operational-expenses/data?operationalExpenseTypeId=${dashboard?.operationalExpense?.largestType?.operationalExpenseTypeId}`} // Updated link
                      rel="noopener noreferrer"
                    >
                      View more
                      <CIcon icon={cilArrowRight} className="float-end" width={16} />
                    </NavLink>
                  }
                  icon={<CIcon icon={cilDollar} height={24} />} // Use an icon related to money/expenses
                  title={t('Kategori beban biaya operasional terbesar')}
                  value={
                    dashboard?.operationalExpense?.largestType === null
                      ? '-'
                      : `${dashboard?.operationalExpense?.largestType?.type}`
                  }
                />
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      )}
    </>
  )
}

export default Dashboard
