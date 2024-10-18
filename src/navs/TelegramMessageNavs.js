import { CNavItem } from '@coreui/react-pro'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const TelegramMessage = [
  {
    component: CNavItem,
    name: 'Data Pesan Telegram',
    to: '/telegram-messages/data',
    icon: <FontAwesomeIcon icon={faPaperPlane} className="nav-icon no-fill-icon" />,
  },
]

export default TelegramMessage
