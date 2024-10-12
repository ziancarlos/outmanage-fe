const formatToISODate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0]
}

export { formatToISODate }
