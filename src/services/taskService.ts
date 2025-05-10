
import { Task, TaskStatus } from "@/types/task";

// Mock data for tasks
const generateMockTasks = (): Task[] => {
  const statuses: TaskStatus[] = [
    "allocateDriver",
    "pendingCollection",
    "returned",
    "onRouteCollection",
    "unlock",
    "onRouteKovi",
    "towRequest",
    "onRouteTow",
    "underAnalysis",
    "unlawfulAppropriation",
    "collected",
    "canceled"
  ];

  return Array.from({ length: 20 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    
    const id = `TASK-${1000 + i}`;
    const plate = `ABC${1000 + i}`;
    
    return {
      id,
      plate,
      vehicleModel: ["Toyota Corolla", "Honda Civic", "Hyundai HB20", "Volkswagen Gol", "Fiat Uno"][Math.floor(Math.random() * 5)],
      customerName: ["João Silva", "Maria Souza", "Pedro Almeida", "Ana Santos", "Carlos Ferreira"][Math.floor(Math.random() * 5)],
      phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      registeredAddress: "Av. Paulista, 1000, São Paulo - SP",
      currentAddress: "Rua Augusta, 500, São Paulo - SP",
      googleMapsLink: "https://maps.google.com",
      partnerId: ["1", "2", "3"][Math.floor(Math.random() * 3)],
      partnerName: ["Parceiro A", "Parceiro B", "Parceiro C"][Math.floor(Math.random() * 3)],
      unitId: ["1", "2"][Math.floor(Math.random() * 2)],
      unitName: ["Unidade Centro", "Unidade Sul"][Math.floor(Math.random() * 2)],
      observations: Math.random() > 0.5 ? "Cliente informou que o carro está estacionado na garagem do prédio" : undefined,
      status,
      createdAt,
      updatedAt: new Date(),
      assignedDriverId: Math.random() > 0.3 ? `d-${Math.floor(Math.random() * 100)}` : undefined,
      assignedDriverName: Math.random() > 0.3 ? ["Carlos Motorista", "Eduardo Motorista", "Marcos Motorista"][Math.floor(Math.random() * 3)] : undefined,
      history: [
        {
          id: `hist-${id}-1`,
          taskId: id,
          status: "allocateDriver",
          timestamp: createdAt,
          userId: "1",
          userName: "Admin Kovi",
          action: "Tarefa criada"
        }
      ]
    };
  });
};

let mockTasks = generateMockTasks();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const TaskService = {
  getTasks: async (filters?: { status?: TaskStatus | "all"; search?: string; partnerId?: string; dateFrom?: string; dateTo?: string; slaStatus?: string; }) => {
    await delay(800);
    
    let filteredTasks = [...mockTasks];
    
    if (filters?.status && filters.status !== "all") {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.plate.toLowerCase().includes(search) || 
        task.customerName.toLowerCase().includes(search)
      );
    }
    
    if (filters?.partnerId && filters.partnerId !== "all") {
      filteredTasks = filteredTasks.filter(task => task.partnerId === filters.partnerId);
    }

    // Add date range filtering
    if (filters?.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filteredTasks = filteredTasks.filter(task => new Date(task.createdAt) >= dateFrom);
    }
    
    if (filters?.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59); // End of day
      filteredTasks = filteredTasks.filter(task => new Date(task.createdAt) <= dateTo);
    }
    
    // Add SLA-based filtering
    if (filters?.slaStatus) {
      filteredTasks = filteredTasks.filter(task => {
        const created = new Date(task.createdAt);
        const now = new Date();
        const hoursSinceCreation = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
        
        if (filters.slaStatus === "urgent" && hoursSinceCreation >= 24) {
          return true;
        } else if (filters.slaStatus === "atrisk" && hoursSinceCreation >= 12 && hoursSinceCreation < 24) {
          return true;
        } else if (filters.slaStatus === "ontime" && hoursSinceCreation < 12) {
          return true;
        }
        return false;
      });
    }
    
    return filteredTasks;
  },
  
  getTaskById: async (id: string) => {
    await delay(500);
    return mockTasks.find(task => task.id === id);
  },
  
  createTask: async (taskData: Partial<Task>) => {
    await delay(800);
    
    const newTask: Task = {
      id: `TASK-${1000 + mockTasks.length}`,
      plate: taskData.plate || "",
      vehicleModel: taskData.vehicleModel || "",
      customerName: taskData.customerName || "",
      phone: taskData.phone || "",
      optionalPhone: taskData.optionalPhone,
      registeredAddress: taskData.registeredAddress || "",
      currentAddress: taskData.currentAddress || "",
      googleMapsLink: taskData.googleMapsLink,
      partnerId: taskData.partnerId || "",
      partnerName: taskData.partnerName || "",
      unitId: taskData.unitId || "",
      unitName: taskData.unitName || "",
      observations: taskData.observations,
      driverLink: taskData.driverLink,
      status: "allocateDriver",
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        {
          id: `hist-${taskData.id}-1`,
          taskId: taskData.id || "",
          status: "allocateDriver",
          timestamp: new Date(),
          userId: "1", // Mock user ID
          userName: "Admin Kovi",
          action: "Tarefa criada"
        }
      ]
    };
    
    mockTasks.push(newTask);
    return newTask;
  },
  
  updateTaskStatus: async (id: string, status: TaskStatus, comments?: string) => {
    await delay(500);
    
    const taskIndex = mockTasks.findIndex(task => task.id === id);
    if (taskIndex < 0) return null;
    
    const updatedTask = { 
      ...mockTasks[taskIndex],
      status,
      updatedAt: new Date()
    };
    
    // Add history item
    updatedTask.history.push({
      id: `hist-${id}-${updatedTask.history.length + 1}`,
      taskId: id,
      status,
      timestamp: new Date(),
      userId: "1", // Mock user ID
      userName: "Admin Kovi",
      action: `Status alterado para ${status}`,
      comments
    });
    
    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  },
  
  assignDriver: async (taskId: string, driverId: string, driverName: string) => {
    await delay(500);
    
    const taskIndex = mockTasks.findIndex(task => task.id === taskId);
    if (taskIndex < 0) return null;
    
    const updatedTask = { 
      ...mockTasks[taskIndex],
      assignedDriverId: driverId,
      assignedDriverName: driverName,
      status: "pendingCollection" as TaskStatus,
      updatedAt: new Date()
    };
    
    // Add history item
    updatedTask.history.push({
      id: `hist-${taskId}-${updatedTask.history.length + 1}`,
      taskId,
      status: "pendingCollection",
      timestamp: new Date(),
      userId: "1", // Mock user ID
      userName: "Admin Kovi",
      action: `Motorista ${driverName} alocado à tarefa`
    });
    
    mockTasks[taskIndex] = updatedTask;
    return updatedTask;
  }
};
