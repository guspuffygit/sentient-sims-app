import { PropsWithChildren } from 'react';

export default function SpaceBetweenDiv({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {children}
    </div>
  );
}
