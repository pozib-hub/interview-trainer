
import { Box, Spinner, Typography } from "@ui/index";

function EditorSkeleton() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" style={{ height: "100%", background: "var(--bg)" }}>
      <Typography color="text-muted" size={13}>
        <Spinner mr={8} />
        Загрузка редактора…
      </Typography>
    </Box>
  );
}

export default EditorSkeleton;
