import React, { useState, useEffect } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormCheck,
  CFormRange,
  CButton,
  CAlert,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
  CMultiSelect,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons'

const CreateRent = () => {
  useEffect(() => {
    console.log('halo')
  })
  return (
    <CRow className="mb-3">
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Tambah Transaksi Pembelian</strong>
          </CCardHeader>
          <CForm>
            <CCardBody>
              <CAlert color="danger" />

              <div className="mb-3">
                <CMultiSelect
                  label={'Klien'}
                  multiple={false}
                  options={[]}
                  loading={false}
                  disabled={false}
                  resetSelectionOnOptionsChange={true}
                  cleaner={false}
                />
              </div>

              <div className="mb-3">
                <CFormLabel className="fw-bold me-2">Barang Pembelian</CFormLabel>
                <CRow className="align-items-center mb-2">
                  <CCol lg={3} className="mb-2">
                    <CMultiSelect
                      options={[]}
                      multiple={false}
                      resetSelectionOnOptionsChange={true}
                      loading={false}
                      cleaner={false}
                    />
                  </CCol>
                  <CCol lg={2} className="mb-2">
                    <CFormInput type="text" placeholder="Kuantitas" />
                  </CCol>
                  <CCol lg={3} className="mb-2">
                    <CFormInput type="text" placeholder="Harga Satuan" />
                  </CCol>
                  <CCol lg={3} className="mb-2">
                    <CFormInput type="text" placeholder="Total Harga" readOnly />
                  </CCol>
                  <CCol lg={1}>
                    <CButton color="primary">
                      <FontAwesomeIcon icon={faPlus} />
                    </CButton>
                  </CCol>
                </CRow>
              </div>

              <div className="mb-3">
                <div className="table-responsive">
                  <CTable striped bordered responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Kondisi</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Kuantitas</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Harga Satuan</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Total Harga</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      <CTableRow>
                        <CTableDataCell>Item Name</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="primary">BARU</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>1</CTableDataCell>
                        <CTableDataCell>1000</CTableDataCell>
                        <CTableDataCell>1000</CTableDataCell>
                        <CTableDataCell>
                          <CButton color="danger">
                            <FontAwesomeIcon icon={faTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </div>
              </div>

              <div className="mb-3">
                <CFormLabel className="fw-bold">Ongkos Antar</CFormLabel>
                <CFormInput type="text" placeholder="Ongkos Antar" />
              </div>

              <div className="mb-3">
                <CFormLabel className="fw-bold">Total Harga</CFormLabel>
                <CFormInput type="text" readOnly />
              </div>

              <div>
                <div className="mb-3">
                  <CFormLabel className="fw-bold">Jumlah Yang Dibayarkan</CFormLabel>
                  <CFormRange />
                  <CFormInput type="text" />
                </div>

                <div className="mb-3">
                  <CFormLabel htmlFor="paymentMethod" className="fw-bold d-block">
                    Metode Pembayaran
                  </CFormLabel>
                  <CFormCheck
                    inline
                    type="radio"
                    name="paymentMethod"
                    id="transfer"
                    label="Transfer"
                  />
                  <CFormCheck inline type="radio" name="paymentMethod" id="cash" label="Tunai" />
                </div>

                <div className="mb-3">
                  <CFormLabel className="fw-bold">Deskripsi</CFormLabel>
                  <CFormTextarea rows={3} placeholder="Masukkan deskripsi" />
                </div>
              </div>
            </CCardBody>

            <CCardFooter className="text-start">
              <CButton color="primary" className="me-2">
                <FontAwesomeIcon icon={faSave} />
              </CButton>
              <CButton color="danger">
                <FontAwesomeIcon icon={faTimes} />
              </CButton>
            </CCardFooter>
          </CForm>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateRent
