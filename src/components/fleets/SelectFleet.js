import { CMultiSelect, useDebouncedCallback } from '@coreui/react-pro'
import { useEffect, useState } from 'react'

export default function SelectFleet({
  label,
  formLoading,
  navigate,
  fleetValue,
  setFleetValue,
  axiosPrivate,
  resetSelectionOnOptionsChange = true,
  defaultValue = null,
  ...props
}) {
  const [fleetOptions, setFleetOptions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchFleets = async (value) => {
    if (!value) return

    setLoading(true)

    try {
      const params = value
        ? { model: value, licensePlate: value, page: 1, size: 5 }
        : { page: 1, size: 5 }
      const response = await axiosPrivate.get('/api/fleets', { params })
      const options = response.data.data.map((fleet) => ({
        value: fleet.fleetId,
        label: `${fleet.model} | ${fleet.licensePlate} `,
      }))

      setFleetOptions(options)
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

  const debouncedFetchFleets = useDebouncedCallback((value) => {
    fetchFleets(value)
  }, 300)

  useEffect(() => {
    if (defaultValue) {
      setFleetOptions([{ ...defaultValue, selected: true }])
    }
  }, [])

  useEffect(() => {
    if (!fleetValue) {
      setFleetOptions([])
    }
  }, [fleetValue])

  return (
    <CMultiSelect
      {...props}
      label={label}
      multiple={false}
      loading={loading}
      options={fleetOptions}
      onFilterChange={debouncedFetchFleets}
      disabled={formLoading}
      resetSelectionOnOptionsChange={resetSelectionOnOptionsChange}
      cleaner={false}
      onChange={(e) => {
        if (e.length < 1) return

        setFleetValue(e[0] || null)
      }}
    />
  )
}
