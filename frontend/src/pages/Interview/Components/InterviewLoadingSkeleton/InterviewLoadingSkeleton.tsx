
import { Box, Skeleton, Spinner, Typography } from "@ui/index";

interface IInterviewLoadingSkeletonProps {
  layout: { leftPane: number };
}

function InterviewLoadingSkeleton(props: IInterviewLoadingSkeletonProps) {
  const { layout } = props;

  return (
    <div className="AppShell">
      <header className="AppHeader">
        <h1>Собеседование</h1>
        <Typography color="text-muted" size={12}>
          <Spinner mr={6} />
          Загрузка задачи…
        </Typography>
      </header>
      <div className="AppBody">
        <div
          className="LeftPane"
          style={{ width: layout.leftPane, flexShrink: 0 }}
        >
          <Box p={20}>
            <Skeleton line width="70%" height={20} />
            <Skeleton line width="40%" height={14} mt={12} />
            <Skeleton line width="90%" height={14} mt={20} />
            <Skeleton line width="85%" height={14} mt={8} />
          </Box>
        </div>
        <div className="RightPane">
          <Box display="flex" alignItems="center" justifyContent="center">
            <Spinner size="big" />
          </Box>
        </div>
      </div>
    </div>
  );
}

export default InterviewLoadingSkeleton;
