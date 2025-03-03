
import { Task } from "@/types/mentorship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TasksListProps {
  tasks: Task[] | undefined;
  isLoading?: boolean;
}

export function TasksList({ tasks, isLoading }: TasksListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading tasks...</p>
          ) : (
            <>
              {tasks?.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    {task.due_date && (
                      <p className="text-sm text-gray-500 mt-2">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!tasks || tasks.length === 0) && (
                <p className="text-center text-gray-500">No tasks assigned yet</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
