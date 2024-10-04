function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  })
    .format(number)
    .replace('IDR', 'Rp')
    .trim()
}

function handlePriceInput(value) {
  const numericValue = value.replace(/[^\d]/g, '')
  return numericValue ? parseInt(numericValue, 10) : 0
}

export { formatRupiah, handlePriceInput }
