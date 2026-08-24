export interface EventOrganizer {
  _id: string
  firstName: string
  lastName: string
  email: string
}

export interface CategoryRef {
  _id: string
  name: string
}

export interface EventItem {
  _id: string
  title: string
  description: string
  category: CategoryRef
  date: string
  hour: string
  location: string
  capacity: number
  image: string | null
  organizer: EventOrganizer
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
  // Cantidad de inscripciones actuales. Solo viene poblado en GET /events y GET /events/:id.
  registeredCount?: number
}

export interface RegistrationItem {
  _id: string
  event: EventItem | null
  user: string
  createdAt: string
}

export interface FavoriteItem {
  _id: string
  event: EventItem | null
  user: string
  createdAt: string
}

export interface RegistrationParticipant {
  _id: string
  firstName: string
  lastName: string
  email: string
}

export interface RegistrationEventRef {
  _id: string
  title: string
  date: string
  hour: string
  organizer: EventOrganizer
}

// Inscripcion vista desde la perspectiva de quien organiza (GET /api/registrations):
// a diferencia de RegistrationItem, aca "user" viene poblado con los datos del participante.
export interface RegistrationDetailItem {
  _id: string
  user: RegistrationParticipant | null
  event: RegistrationEventRef | null
  createdAt: string
}

export interface CategoryItem {
  _id: string
  name: string
  description: string
  isActive: boolean
}

export interface NotificationEventRef {
  _id: string
  title: string
  date: string
  hour: string
  location: string
}

export interface NotificationItem {
  _id: string
  event: NotificationEventRef | null
  organizer: string
  type: string
  message: string
  read: boolean
  createdAt: string
}

export interface UserDashboard {
  role: 'user'
  registrationsCount: number
  favoritesCount: number
  upcomingRegistrations: RegistrationItem[]
}

export interface OrganizerDashboard {
  role: 'organizer'
  totalEvents: number
  activeEvents: number
  totalRegistrations: number
  events: EventItem[]
}

export interface AdminDashboard {
  role: 'admin'
  totalUsers: number
  totalOrganizers: number
  totalAdmins: number
  totalEvents: number
  eventsByStatus: { active: number; completed: number; cancelled: number }
  totalRegistrations: number
}

export type DashboardData = UserDashboard | OrganizerDashboard | AdminDashboard
