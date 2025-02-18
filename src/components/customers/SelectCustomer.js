import { CMultiSelect, useDebouncedCallback } from '@coreui/react-pro'
import { useEffect, useState } from 'react'

export default function SelectCustomer({
  label,
  formLoading,
  navigate,
  customerValue,
  setCustomerValue,
  axiosPrivate,
  resetSelectionOnOptionsChange = true,
  defaultValue = null,
  ...props
}) {
  const [customerOptions, setCustomerOptions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCustomers = async (value) => {
    if (!value) return

    setLoading(true)

    try {
      const params = value ? { name: value, page: 1, size: 5 } : { page: 1, size: 5 }
      const response = await axiosPrivate.get('/api/customers', { params })
      const options = response.data.data.map((customer) => ({
        value: customer.customerId,
        label: `${customer.name} `,
      }))

      setCustomerOptions(options)
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

  const debouncedFetchCustomers = useDebouncedCallback((value) => {
    fetchCustomers(value)
  }, 300)

  useEffect(() => {
    if (defaultValue) {
      setCustomerOptions([{ ...defaultValue, selected: true }])
    }
  }, [])

  useEffect(() => {
    if (!customerValue) {
      setCustomerOptions([])
    }
  }, [customerValue])

  return (
    <CMultiSelect
      {...props}
      label={label}
      multiple={false}
      loading={loading}
      options={customerOptions}
      onFilterChange={debouncedFetchCustomers}
      disabled={formLoading}
      resetSelectionOnOptionsChange={resetSelectionOnOptionsChange}
      cleaner={false}
      onChange={(e) => {
        if (e.length < 1) return

        setCustomerValue(e[0] || null)
      }}
    />
  )
}
