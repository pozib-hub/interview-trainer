export type MessageType = { id: number; message: string };
export type ConnectFnType = (onMessage: (msg: MessageType) => void) => void;
export type RenderFnType = (msg: string) => void;
export type SubscribeFnType = (connect: ConnectFnType, render: RenderFnType) => void;

export const subscribe: SubscribeFnType = (connect, render) => {
  const store = new Map<number, string>();
  let nextId = 1;

  connect((msg) => {
    if (msg.id === nextId) {
      render(msg.message);
      nextId++;
      while (store.has(nextId)) {
        render(store.get(nextId)!);
        store.delete(nextId);
        nextId++;
      }
    } else {
      store.set(msg.id, msg.message);
    }
  });
};
