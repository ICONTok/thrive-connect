
import { TaskList } from "@/components/tasks/TaskList";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Card } from "@/components/ui/card";

const Tasks = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
          <TaskForm />
        </Card>
        <TaskList />
      </div>
    </div>
  );
};

export default Tasks;
