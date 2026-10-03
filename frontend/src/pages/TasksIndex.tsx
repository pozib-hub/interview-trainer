import { EmptyState, Typography } from "@ui/index";

export default function TasksIndex() {
  return (
    <EmptyState>
      <Typography align="center">
        <Typography size={32} mb={12}>👈</Typography>
        Выберите задачу слева, чтобы начать
      </Typography>
    </EmptyState>
  );
}
