
import type { TaskFull } from "@lib/types";
import ConditionPanel from "@components/ConditionPanel";
import { Box, DifficultyBadge, Tag, Typography } from "@ui/index";

interface ITaskConditionViewProps {
  task: TaskFull;
}

function TaskConditionView(props: ITaskConditionViewProps) {
  const { task } = props;

  return (
    <>
      <Box p="16px 20px 0">
        <Box display="flex" alignItems="center" gap={10} flexWrap="wrap">
          <Typography tag="h2" size={18} m={0}>{task.title}</Typography>
          <DifficultyBadge difficulty={task.difficulty} />
        </Box>
        <Box mt={8} mb={4}>
          {task.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </Box>
      </Box>
      <ConditionPanel condition={task.condition} hints={task.hints} />
    </>
  );
}

export default TaskConditionView;
