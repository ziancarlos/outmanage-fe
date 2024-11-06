import React from 'react'
const DataProject = React.lazy(() => import('../views/projects/DataProject'))
const DataProjectLog = React.lazy(() => import('../views/projects/DataProjectLog'))
const DetailProject = React.lazy(() => import('../views/projects/DetailProject'))
const CreateProject = React.lazy(() => import('../views/projects/CreateProject'))
const UpdateProject = React.lazy(() => import('../views/projects/UpdateProject'))

const ProjectRoutes = [
  {
    path: '/projects/data',
    name: 'Data Proyek',
    element: DataProject,
    permissions: ['read-projects'],
  },

  {
    path: '/projects/new',
    name: 'Tambah Proyek',
    element: CreateProject,
    permissions: ['create-project', 'read-clients'],
  },

  {
    path: '/projects/log',
    name: 'Data Log Proyek',
    element: DataProjectLog,
    permissions: ['read-projects-logs'],
  },

  {
    path: '/projects/:projectId/detail',
    name: 'Detil Proyek',
    element: DetailProject,
    permissions: ['read-project'],
  },

  {
    path: '/projects/:projectId/edit',
    name: 'Ubah Proyek',
    element: UpdateProject,
    permissions: ['update-project', 'read-clients', 'read-project'],
  },
]

export default ProjectRoutes
