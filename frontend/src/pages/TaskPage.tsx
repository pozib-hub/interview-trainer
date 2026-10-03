import { useParams } from "react-router-dom";
import TaskPageClient from "./TaskPageClient";

export default function TaskPage() {
  const { "*": rest } = useParams();
  const taskId = decodeURIComponent(rest ?? "");
  if (!taskId) return null;
  return <TaskPageClient taskId={taskId} />;
}
