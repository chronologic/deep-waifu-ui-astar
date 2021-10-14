import React from 'react';

import { WaifuProvider } from './contexts';

interface IProps {
  children: React.ReactNode;
}

export default function Providers({ children }: IProps) {
  return <WaifuProvider>{children}</WaifuProvider>;
}
