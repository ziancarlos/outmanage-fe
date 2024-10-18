import React from 'react'

const DataTelegramMessage = React.lazy(
  () => import('../views/telegram-messages/DataTelegramMessage'),
)

const TelegramMessageRoutes = [
  {
    path: '/telegram-messages/data',
    name: 'Data Pesan Telegram',
    element: DataTelegramMessage,
    permissions: ['read-telegram-messages'],
  },
]

export default TelegramMessageRoutes
