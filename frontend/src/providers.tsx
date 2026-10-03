import type { ReactNode } from "react";
import { AppDataProvider } from "@hooks/useAppData";
import { LayoutProvider } from "@hooks/useResizableLayout";
import { ThemeProvider } from "@hooks/useTheme";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <LayoutProvider>{children}</LayoutProvider>
      </AppDataProvider>
    </ThemeProvider>
  );
}
