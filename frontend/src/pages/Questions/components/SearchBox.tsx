
import styles from "../questions.module.css";

interface ISearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function SearchBox(props: ISearchBoxProps) {
  const { value, onChange, placeholder } = props;

  return (
    <div className={styles.Search}>
      <span className={styles.SearchIcon}>🔍</span>
      <input
        className={styles.SearchInput}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      {value && (
        <button
          className={styles.SearchClear}
          onClick={() => onChange("")}
          title="Очистить"
        >
          ✕
        </button>
      )}
    </div>
  );
}
