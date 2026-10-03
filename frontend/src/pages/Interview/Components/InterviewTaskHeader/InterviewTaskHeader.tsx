
import type { TaskFull } from "@lib/types";
import { Box, DifficultyBadge, Tag, Typography } from "@ui/index";

interface IInterviewTaskHeaderProps {
  task: TaskFull;
}

function InterviewTaskHeader(props: IInterviewTaskHeaderProps) {
  const { task } = props;

  return (
    <Box p="16px 20px 0">
      <Box display="flex" alignItems="center" gap={10} flexWrap="wrap">
        <Typography tag="h2" size={18} m={0}>
          {task.title}
        </Typography>
        <DifficultyBadge
          difficulty={task.difficulty as "easy" | "medium" | "hard"}
        />
      </Box>
      <Box mt={8} mb={4}>
        <Tag>{task.topic}</Tag>
        {task.tags.slice(0, 3).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </Box>
    </Box>
  );
}

export default InterviewTaskHeader;
