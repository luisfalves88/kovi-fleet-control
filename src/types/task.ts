
export interface Task {
  id: string;
  plate: string; // Vehicle plate (used as title)
  vehicleModel: string;
  customerName: string;
  phone: string;
  optionalPhone?: string;
  registeredAddress: string;
  currentAddress: string;
  googleMapsLink?: string;
  partnerId: string;
  partnerName: string;
  unitId: string;
  unitName: string;
  observations?: string;
  driverLink?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedDriverId?: string;
  assignedDriverName?: string;
  history: TaskHistoryItem[];
}

export type TaskStatus =
  | "allocateDriver"
  | "pendingCollection"
  | "returned"
  | "onRouteCollection"
  | "unlock"
  | "onRouteKovi"
  | "towRequest"
  | "onRouteTow"
  | "underAnalysis"
  | "unlawfulAppropriation"
  | "collected"
  | "canceled";

export interface TaskHistoryItem {
  id: string;
  taskId: string;
  status: TaskStatus;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  comments?: string;
}

export interface TaskFilter {
  status?: TaskStatus | "all";
  search?: string;
  partnerId?: string;
  driverId?: string;
}
