
export type UserRole = 'admin' | 'member' | 'partner' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  role: UserRole;
  company: string;
  isActive: boolean;
  photoUrl?: string;
  createdAt: Date;
}

export interface Partner {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  responsibleName: string;
  responsiblePhone: string;
  responsibleEmail: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Unit {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
}

export type TaskStatus = 
  | 'allocate_driver'
  | 'pending_collection'
  | 'returned'
  | 'collecting_route' 
  | 'unlock'
  | 'kovi_route'
  | 'tow_request'
  | 'tow_route'
  | 'analysis'
  | 'illegal_appropriation'
  | 'collected'
  | 'cancelled';

export interface Task {
  id: string;
  licensePlate: string; // Placa
  vehicleModel: string; // Modelo
  clientName: string; // Nome do cliente
  contactPhone: string; // Telefone de contato
  optionalPhone?: string; // Telefone opcional
  registeredAddress: string; // Endereço de cadastro
  currentAddress: string; // Endereço onde o veículo está
  googleMapsLink?: string; // Link do Google Maps
  partnerId: string; // Empresa parceira
  partnerName: string; // Nome da empresa parceira
  unitId: string; // Unidade de entrega
  unitName: string; // Nome da unidade de entrega
  observations?: string; // Observações
  driverId?: string; // ID do motorista atribuído
  driverName?: string; // Nome do motorista atribuído
  status: TaskStatus; // Status atual
  slaExpiration?: Date; // Data de expiração do SLA
  createdAt: Date;
  createdBy: string; // ID do usuário que criou
  history: TaskHistoryItem[]; // Histórico de ações
  checklist?: TaskChecklist; // Checklist de recolha
}

export interface TaskHistoryItem {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  status: TaskStatus;
  details?: string;
}

export interface TaskChecklist {
  frontPhoto?: string;
  rearPhoto?: string;
  rightSidePhoto?: string;
  leftSidePhoto?: string;
  dashboardPhoto?: string;
  spareWheelPhoto?: string;
  damages: {
    rightHeadlight: boolean;
    leftHeadlight: boolean;
    rightTailLight: boolean;
    leftTailLight: boolean;
    driverDoor: boolean;
    passengerDoor: boolean;
    rightBackDoor: boolean;
    leftBackDoor: boolean;
    trunk: boolean;
    tires: boolean;
    key: boolean;
    dashboard: boolean;
    mirrors: boolean;
    hood: boolean;
    driverSeat: boolean;
    passengerSeat: boolean;
    backSeat: boolean;
    frontPlate: boolean;
    rearPlate: boolean;
  };
  damagePhotos?: Record<string, string>;
  personalItems?: string;
}

export interface ChatMessage {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  attachment?: string;
  replyTo?: string;
  likes: string[];
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  taskId?: string;
  type: 'task_created' | 'task_cancelled' | 'task_completed' | 'unlock_request' | 'task_returned' | 'analysis_request' | 'tow_request';
}
