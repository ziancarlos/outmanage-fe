import { CMultiSelect, useDebouncedCallback } from '@coreui/react-pro'
import { useEffect, useState } from 'react'

export default function SelectItem({
  label,
  formLoading,
  navigate,
  itemValue,
  setItemValue,
  axiosPrivate,
  ...props
}) {
  const [itemOptions, setItemOptions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchItems = async (value) => {
    if (!value) return

    setLoading(true)

    try {
      const params = value ? { name: value, page: 1, size: 5 } : { page: 1, size: 5 }
      const response = await axiosPrivate.get('/api/items', { params })
      const options = response.data.data.map((item) => ({
        value: item.itemId,
        label: `${item.name} `,
      }))

      setItemOptions(options)
    } catch (e) {
      console.log(e)
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

  const debouncedFetchItems = useDebouncedCallback((value) => {
    fetchItems(value)
  }, 300)

  useEffect(() => {
    if (!itemValue) {
      setItemOptions([])
    }
  }, [itemValue])

  return (
    <CMultiSelect
      {...props}
      label={label}
      multiple={false}
      loading={loading}
      options={itemOptions}
      onFilterChange={debouncedFetchItems}
      disabled={formLoading}
      resetSelectionOnOptionsChange={true}
      cleaner={false}
      onChange={(e) => {
        if (e.length < 1) return

        setItemValue(e[0] || null)
      }}
    />
  )
}
