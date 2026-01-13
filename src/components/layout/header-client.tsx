'use client';

import { Suspense } from 'react';
import Header from './header';

export default function HeaderClient() {
  return (
    <Suspense fallback={null}>
      <Header />
    </Suspense>
  );
}
