export type MessageType = { id: number; message: string };
export type ConnectFnType = (onMessage: (msg: MessageType) => void) => void;
export type RenderFnType = (message: string) => void;
export type SubscribeFnType = (connect: ConnectFnType, render: RenderFnType) => void;

export const subscribe: SubscribeFnType = (connect, render) => {
  let nextId = 1;
  const buffer = new Map<number, MessageType>();

  const flush = () => {
    while (buffer.has(nextId)) {
      const msg = buffer.get(nextId)!;
      buffer.delete(nextId);
      nextId++;
      render(msg.message);
    }
  };

  connect((msg) => {
    buffer.set(msg.id, msg);
    flush();
  });
};
