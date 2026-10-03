
import { useTheme } from "@hooks/useTheme";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.ThemeToggle}
      onClick={toggleTheme}
    >
      {theme === "dark" ? "☀️" : "🌙"} {theme === "dark" ? "Светлая" : "Тёмная"}
    </button>
  );
}
