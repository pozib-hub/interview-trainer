
import { Box, Skeleton, Spinner } from "@ui/index";

interface ITaskLoadingSkeletonProps {
  layout: { leftPane: number };
}

function TaskLoadingSkeleton(props: ITaskLoadingSkeletonProps) {
  const { layout } = props;

  return (
    <div className="Workspace">
      <div
        className="LeftPane"
        style={{ width: layout.leftPane, flexShrink: 0 }}
      >
        <Box p={20}>
          <Skeleton line width="70%" height={20} />
          <Skeleton line width="40%" height={14} mt={12} />
          <Skeleton line width="90%" height={14} mt={20} />
          <Skeleton line width="85%" height={14} mt={8} />
          <Skeleton line width="60%" height={14} mt={8} />
        </Box>
      </div>
      <div className="RightPane">
        <Box display="flex" alignItems="center" justifyContent="center">
          <Spinner size="big" />
        </Box>
      </div>
    </div>
  );
}

export default TaskLoadingSkeleton;
