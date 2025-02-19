
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { useMentorship } from "@/hooks/use-mentorship";
import { CalendarIcon } from "lucide-react";

interface TaskFormData {
  title: string;
  description: string;
  assigned_to: string;
  due_date: Date;
}

export const TaskForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date>();
  const { currentProfile } = useMentorship(user?.id);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>();

  const { mutate: createTask } = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const { error } = await supabase.from("tasks").insert({
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        assigned_by: user?.id,
        due_date: data.due_date.toISOString(),
        status: "pending"
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      reset();
      setDate(undefined);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      console.error("Error creating task:", error);
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }
    createTask({ ...data, due_date: date });
  };

  if (!currentProfile || (currentProfile.user_type !== 'admin' && currentProfile.user_type !== 'mentor')) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          placeholder="Task title"
          {...register("title", { required: true })}
        />
        {errors.title && <span className="text-red-500">Title is required</span>}
      </div>

      <div>
        <Textarea
          placeholder="Task description"
          {...register("description", { required: true })}
        />
        {errors.description && <span className="text-red-500">Description is required</span>}
      </div>

      <div>
        <Input
          placeholder="Assign to (user ID)"
          {...register("assigned_to", { required: true })}
        />
        {errors.assigned_to && <span className="text-red-500">Assigned to is required</span>}
      </div>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a due date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit">Create Task</Button>
    </form>
  );
};
