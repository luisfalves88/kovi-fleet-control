
import React from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskService } from "@/services/taskService";

const formSchema = z.object({
  plate: z.string().min(1, "A placa é obrigatória"),
  vehicleModel: z.string().min(1, "O modelo do veículo é obrigatório"),
  customerName: z.string().min(1, "O nome do cliente é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  optionalPhone: z.string().optional(),
  registeredAddress: z.string().min(1, "O endereço de cadastro é obrigatório"),
  currentAddress: z.string().min(1, "O endereço atual é obrigatório"),
  googleMapsLink: z.string().optional(),
  partnerId: z.string().min(1, "A empresa parceira é obrigatória"),
  unitId: z.string().min(1, "A unidade de entrega é obrigatória"),
  observations: z.string().optional(),
  driverLink: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTaskFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// Mock partner and unit data
const mockPartners = [
  { id: "1", name: "Parceiro A" },
  { id: "2", name: "Parceiro B" },
  { id: "3", name: "Parceiro C" }
];

const mockUnits = [
  { id: "1", name: "Unidade Centro" },
  { id: "2", name: "Unidade Sul" }
];

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess, onCancel }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: "",
      vehicleModel: "",
      customerName: "",
      phone: "",
      optionalPhone: "",
      registeredAddress: "",
      currentAddress: "",
      googleMapsLink: "",
      observations: "",
      driverLink: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Find the partner name from the ID
      const partner = mockPartners.find(p => p.id === data.partnerId);
      const unit = mockUnits.find(u => u.id === data.unitId);
      
      await TaskService.createTask({
        ...data,
        partnerName: partner?.name || "",
        unitName: unit?.name || ""
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placa do veículo*</FormLabel>
                <FormControl>
                  <Input placeholder="AAA0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo do veículo*</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Toyota Corolla" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do cliente*</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone de contato*</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="optionalPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone opcional</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registeredAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço de cadastro*</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Av. Paulista, 1000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço atual do veículo*</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Rua Augusta, 500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="googleMapsLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link Google Maps</FormLabel>
                <FormControl>
                  <Input placeholder="https://maps.google.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partnerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa parceira*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa parceira" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockPartners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade de entrega*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma unidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="driverLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link do Rental Motorista</FormLabel>
                <FormControl>
                  <Input placeholder="Link para o sistema Rental" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre a tarefa..."
                  {...field}
                  className="resize-none min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Criar Tarefa
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateTaskForm;
