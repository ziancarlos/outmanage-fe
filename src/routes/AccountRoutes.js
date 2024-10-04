import React from 'react'

const Profile = React.lazy(() => import('../views/account/Profile'))
const Settings = React.lazy(() => import('../views/account/Settings'))
const AccountRoutes = [
  { path: '/profile', name: 'Profile', element: Profile, permissions: [] },
  { path: '/settings', name: 'Settings', element: Settings, permissions: [] },
]

export default AccountRoutes
