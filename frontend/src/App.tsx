import { Navigate, Route, Routes } from "react-router-dom";
import Providers from "./providers";
import TasksLayout from "./pages/TasksLayout";
import TasksIndex from "./pages/TasksIndex";
import TaskPage from "./pages/TaskPage";
import InterviewPage from "./pages/Interview";

export default function App() {
  return (
    <Providers>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksLayout />}>
          <Route index element={<TasksIndex />} />
          <Route path="*" element={<TaskPage />} />
        </Route>
        <Route path="/interview" element={<InterviewPage />} />
      </Routes>
    </Providers>
  );
}
