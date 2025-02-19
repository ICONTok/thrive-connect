
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/mentorship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const TaskList = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assigned_by_profile:profiles!tasks_assigned_by_fkey(full_name),
          assigned_to_profile:profiles!tasks_assigned_to_fkey(full_name)
        `);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tasks</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks?.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{task.title}</span>
                <Badge variant={task.status === "completed" ? "success" : "default"}>
                  {task.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{task.description}</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Assigned by:</span>{" "}
                  {task.assigned_by_profile?.full_name}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Assigned to:</span>{" "}
                  {task.assigned_to_profile?.full_name}
                </p>
                {task.due_date && (
                  <p className="text-sm">
                    <span className="font-semibold">Due:</span>{" "}
                    {format(new Date(task.due_date), "PPP")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
