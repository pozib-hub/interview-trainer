# Отредактировать компонент

Отредактировать компонент
    Можно использовать любые обертки, НОС, промежуточные компоненты, hooks и любую верстку.
    Главное, чтобы визуально это выглядело как скроллируемый список.

    const getBigRandomList = () =>
      new Array(1000).fill(0).map(() => Math.random());

    type VirtualListProps = {
      count: number;
      itemHeight: number;
      viewportHeight: number;
      children: (index: number) => React.ReactNode;
    };

    type VirtualListRef = {
      update: () => void;
    };

    const VirtualList = () => {
      return null
    }


    const App = () => {
      const listRef = useRef<VirtualListRef>(null);
      const [items, setItems] = useState<number[]>(() => getBigRandomList());

      const handleRandomizeClick = useCallback(() => {
        flushSync(() => {
          setItems(getBigRandomList());
        });

        listRef.current?.update();
      }, []);

      return (
        <div>
          <button onClick={handleRandomizeClick}>Pандомизировать</button>
          <VirtualList
            ref={listRef}
            count={items.length}
            itemHeight={32}
            viewportHeight={648}
          >
            {(i) => {
              return <div style={{ height: 32 }}>{items[i]}</div>;
            }}
          </VirtualList>

          Визуально схоже с этим:

          <div style={{ height: 648, overflowY: "auto" }}>
            {items.map((item, i) => (
              <div key={i}>{item} </div>
            ))}
          </div>
        </div>
      );
    };
