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
