import {
  CAlert,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CRow,
  CSmartPagination,
} from '@coreui/react-pro'
export default function TableCardLayout({
  title,
  error,
  page = null,
  totalPages = null,
  handlePageChange = null,
  footer = null,
  children,
}) {
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <strong>{title}</strong>
      </CCardHeader>

      <CCardBody>
        {error && (
          <CRow className="mb-3">
            <CCol>
              <CAlert color="danger">{error}</CAlert>
            </CCol>
          </CRow>
        )}

        {children}

        {(page || totalPages || handlePageChange) && (
          <CSmartPagination
            size="sm"
            activePage={page}
            pages={totalPages}
            onActivePageChange={handlePageChange}
          />
        )}
      </CCardBody>
      {footer && <CCardFooter>{footer}</CCardFooter>}
    </CCard>
  )
}
