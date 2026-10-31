import { Navigate, Route, Routes } from "react-router-dom";
import Providers from "./providers";
import TasksLayout from "./pages/TasksLayout";
import TasksIndex from "./pages/TasksIndex";
import TaskPage from "./pages/TaskPage";
import InterviewPage from "./pages/Interview";
import ProgressPage from "./pages/Progress";
import LivePage from "./pages/Live";
import QuestionsLayout from "./pages/Questions/QuestionsLayout";
import QuestionsIndexPage from "./pages/Questions/QuestionsIndexPage";
import DirectionPage from "./pages/Questions/DirectionPage";
import TechnologyPage from "./pages/Questions/TechnologyPage";
import MyQuestionsPage from "./pages/Questions/MyQuestionsPage";
import QuestionInterviewPage from "./pages/Questions/QuestionInterviewPage";

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
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/live/:roomId" element={<LivePage />} />

        <Route path="/questions" element={<QuestionsLayout />}>
          <Route index element={<QuestionsIndexPage />} />
          <Route path="my" element={<MyQuestionsPage />} />
          <Route path="interview" element={<QuestionInterviewPage />} />
          <Route path=":direction" element={<DirectionPage />} />
          <Route path=":direction/:technology" element={<TechnologyPage />} />
        </Route>
      </Routes>
    </Providers>
  );
}
