import { useEffect, useRef, useState } from 'react'
import { formatRupiah } from '../../utils/CurrencyUtils'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardText,
  CCardTitle,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner,
} from '@coreui/react-pro'
import useAuth from '../../hooks/useAuth'
import moment from 'moment'
import TableOperationalExpenseLog from '../../components/operational-expense/TableOperationalExpenseLog'
import { formatToISODate } from '../../utils/DateUtils'

const typeOptions = [
  { label: 'Select Type', value: '' },
  { label: 'CREATE', value: 'CREATE' },
  { label: 'UPDATE', value: 'UPDATE' },
]

function DetailOperationalExpense() {
  const { operationalExpenseId } = useParams()
  const { authorizePermissions } = useAuth()

  const canReadOperationalExpenseLogs = authorizePermissions.some(
    (perm) => perm.name === 'read-operational-expense-logs',
  )

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [operationalExpense, setOperationalExpense] = useState('')

  const [operationalExpensesLog, setOperationalExpensesLog] = useState([])
  const [error, setError] = useState('')
  const [searchTypeValue, setSearchTypeValue] = useState('')
  const [searchStartDateValue, setSearchStartDateValue] = useState('')
  const [searchEndDateValue, setSearchEndDateValue] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const searchParamsRef = useRef()

  useEffect(() => {
    setLoading(true)

    const fetchPromises = []

    fetchPromises.push(fetchOperationalExpense(operationalExpenseId))

    if (canReadOperationalExpenseLogs) {
      const queryParams = new URLSearchParams(location.search)
      const searchTypeParamValue = queryParams.get('type')
      const startDateParamValue = queryParams.get('startDate')
      const endDateParamValue = queryParams.get('endDate')

      searchParamsRef.current = {}

      if (searchTypeParamValue) {
        searchParamsRef.current.type = searchTypeParamValue
      }
      if (startDateParamValue) {
        searchParamsRef.current.startDate = startDateParamValue
      }
      if (endDateParamValue) {
        searchParamsRef.current.endDate = endDateParamValue
      }

      fetchPromises.push(fetchOperationalExpenseLog(1, searchParamsRef.current))
    }

    Promise.all(fetchPromises).finally(() => {
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setError('')
  }, [searchTypeValue, searchStartDateValue, searchEndDateValue])

  async function fetchOperationalExpenseLog(page, searchParams) {
    try {
      const response = await axiosPrivate.get(
        `/api/operational-expenses/${operationalExpenseId}/logs`,
        {
          params: { page: page, size: 3, ...searchParams },
        },
      )

      setOperationalExpensesLog(response.data.data)
      setTotalPages(response.data.paging.totalPage)
      setPage(response.data.paging.page)

      setSearchTypeValue('')
      setSearchStartDateValue('')
      setSearchEndDateValue('')
    } catch (e) {
      console.log(e)
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else if (e.response?.status === 400) {
        setError(e.response.data.error)
      } else {
        navigate('/500')
      }
    }
  }

  async function fetchOperationalExpense(operationalExpenseId) {
    try {
      const response = await axiosPrivate.get(`/api/operational-expenses/${operationalExpenseId}`)

      setOperationalExpense(response.data.data)
    } catch (e) {
      if (e?.config?.url === '/api/auth/refresh' && e.response?.status === 400) {
        await logout()
      } else if ([400, 401, 404].includes(e.response?.status)) {
        navigate('/404', { replace: true })
      } else {
        navigate('/500')
      }
    }
  }

  function handleSearch(e) {
    e.preventDefault()

    setSearchLoading(true)

    setPage(1)

    const searchParams = {}

    if (typeOptions[1].value === searchTypeValue || typeOptions[2].value === searchTypeValue) {
      searchParams.type = searchTypeValue
    }

    if (searchStartDateValue) {
      searchParams.startDate = formatToISODate(searchStartDateValue)
    }

    if (searchEndDateValue) {
      searchParams.endDate = formatToISODate(searchEndDateValue)
    }

    searchParamsRef.current = searchParams

    if (Object.keys(searchParams).length > 0) {
      const newParams = new URLSearchParams(searchParams).toString()
      navigate(`${location.pathname}?${newParams}`, { replace: true })
    } else {
      navigate(`/operational-expenses/${operationalExpenseId}/detail`)
    }

    fetchOperationalExpenseLog(1, searchParamsRef.current).finally(() => setSearchLoading(false))
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage)
      setSearchLoading(true)
      fetchOperationalExpenseLog(newPage, searchParamsRef.current).finally(() =>
        setSearchLoading(false),
      )
    }
  }

  return (
    <>
      {loading ? (
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <>
          <CRow>
            <CCol md={12} xs={12} className="mb-4">
              <CCard>
                <CCardBody>
                  <CCardTitle>{'#' + operationalExpense.operationalExpenseId}</CCardTitle>
                </CCardBody>
                <CListGroup flush>
                  <CListGroupItem>
                    Tipe Pengeluaran: {operationalExpense.operationalExpenseType.type}
                  </CListGroupItem>

                  <CListGroupItem>Jumlah: {formatRupiah(operationalExpense.amount)}</CListGroupItem>
                  {operationalExpense.description && (
                    <CListGroupItem>Deskripsi: {operationalExpense.description}</CListGroupItem>
                  )}
                  <CListGroupItem>
                    Tanggal Pengeluaran:{' '}
                    {moment(operationalExpense.date).format('MMMM D, YYYY h:mm A')}
                  </CListGroupItem>
                </CListGroup>
              </CCard>
            </CCol>
          </CRow>

          {canReadOperationalExpenseLogs && (
            <TableOperationalExpenseLog
              title={'Data Log Biaya Operasional'}
              error={error}
              handleSearch={handleSearch}
              typeOptions={typeOptions}
              searchTypeValue={searchTypeValue}
              setSearchTypeValue={setSearchTypeValue}
              searchStartDateValue={searchStartDateValue}
              setSearchStartDateValue={setSearchStartDateValue}
              searchEndDateValue={searchEndDateValue}
              setSearchEndDateValue={setSearchEndDateValue}
              searchLoading={searchLoading}
              operationalExpenseLog={operationalExpensesLog}
              page={page}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              authorizePermissions={authorizePermissions}
            />
          )}
        </>
      )}
    </>
  )
}

export default DetailOperationalExpense
