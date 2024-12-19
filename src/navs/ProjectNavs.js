import { CNavGroup, CNavItem } from '@coreui/react-pro'
import { faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ProjectNavs = [
  {
    component: CNavGroup,
    name: 'Proyek',
    icon: <FontAwesomeIcon icon={faProjectDiagram} className="nav-icon no-fill-icon" />,
    permissions: ['read-projects', 'create-project', 'read-projects-logs'],
    items: [
      {
        component: CNavItem,
        name: 'Data Proyek',
        to: '/projects/data',
        permissions: ['read-projects'],
      },
      {
        component: CNavItem,
        name: 'Create Proyek',
        to: '/projects/new',
        permissions: ['create-project', 'read-clients'],
      },
      {
        component: CNavItem,
        name: 'Data Proyek Log',
        to: '/projects/log',
        permissions: ['read-projects-logs'],
      },
    ],
  },
]

export default ProjectNavs
