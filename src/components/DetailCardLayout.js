import {
  CCard,
  CCardBody,
  CCardFooter,
  CCardTitle,
  CCol,
  CListGroup,
  CListGroupItem,
} from '@coreui/react-pro'

export function DetailCardLayout({ title, children, footer = null, ...props }) {
  return (
    <CCol {...props}>
      <CCard>
        <CCardBody>
          <CCardTitle>{title}</CCardTitle>
        </CCardBody>
        <CListGroup flush>{children}</CListGroup>
        {footer && <CCardFooter>{footer}</CCardFooter>}
      </CCard>
    </CCol>
  )
}
