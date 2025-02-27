import { CMultiSelect, useDebouncedCallback } from '@coreui/react-pro'
import { useEffect, useState } from 'react'

export default function SelectDeliveryOrder({
  label,
  formLoading,
  navigate,
  deliveryOrderValue,
  setDeliveryOrderValue,
  axiosPrivate,
  resetSelectionOnOptionsChange = true,
  defaultValue = null,
  ...props
}) {
  const [deliveryOrderOptions, setDeliveryOrderOptions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchDeliveryOrders = async (value) => {
    if (!value) return

    setLoading(true)

    try {
      const params = value
        ? { name: value, deliveryOrderValue: value, page: 1, size: 100 }
        : { page: 1, size: 5 }
      const response = await axiosPrivate.get('/api/delivery-orders', { params })
      const options = response.data.data.map((deliveryOrder) => ({
        value: deliveryOrder.deliveryOrderId,
        label: `${deliveryOrder.customer.name} | DO${deliveryOrder.deliveryOrderId}`,
      }))

      setDeliveryOrderOptions(options)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if (e.response?.status === 401) {
        navigate('/404', { replace: true })
      } else if ([400].includes(e.response?.status)) {
        setError(e.response?.data.error)
      } else {
        navigate('/500')
      }
    } finally {
      setLoading(false)
    }
  }

  const debouncedFetchDeliveryOrders = useDebouncedCallback((value) => {
    fetchDeliveryOrders(value)
  }, 300)

  useEffect(() => {
    if (defaultValue) {
      setDeliveryOrderOptions([{ ...defaultValue, selected: true }])
    }
  }, [])

  useEffect(() => {
    if (!deliveryOrderValue) {
      setDeliveryOrderOptions([])
    }
  }, [deliveryOrderValue])

  return (
    <CMultiSelect
      {...props}
      label={label}
      multiple={false}
      loading={loading}
      options={deliveryOrderOptions}
      onFilterChange={debouncedFetchDeliveryOrders}
      disabled={formLoading}
      resetSelectionOnOptionsChange={resetSelectionOnOptionsChange}
      cleaner={false}
      onChange={(e) => {
        if (e.length < 1) return

        setDeliveryOrderValue(e[0] || null)
      }}
    />
  )
}
