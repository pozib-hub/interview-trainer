import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Button, Spacer, ThemeToggle } from "@ui/index";
import UserMenu from "@components/UserMenu";
import QuestionProposalModal from "@components/QuestionProposalModal";
import { fetchQuestionsIndex } from "@lib/questionsApi";
import type { QuestionsIndex } from "@lib/types";
import styles from "./questions.module.css";

export default function QuestionsLayout() {
  const [index, setIndex] = useState<QuestionsIndex | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);

  useEffect(() => {
    fetchQuestionsIndex().then(setIndex).catch(() => setIndex({ directions: [] }));
  }, []);

  return (
    <div className="AppShell">
      <header className="AppHeader">
        <h1>Вопросы с собеседований</h1>
        <Spacer />
        <ThemeToggle />
        <UserMenu />
        <Button size="sm" href="/tasks">🧩 Задачи</Button>
        <Button size="sm" href="/interview">🎯 Собеседование</Button>
        <Button size="sm" href="/questions/my">⭐ Мои вопросы</Button>
        <Button size="sm" href="/questions/interview">🎤 Устный собес</Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setProposalOpen(true)}
          title="Предложить вопрос — ИИ оформит ответ и откроет pull request"
        >
          ➕ Добавить вопрос
        </Button>
      </header>
      <main className={styles.Main}>
        <Outlet />
      </main>
      <QuestionProposalModal
        open={proposalOpen}
        onClose={() => setProposalOpen(false)}
        index={index}
      />
    </div>
  );
}
