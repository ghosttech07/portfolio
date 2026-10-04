'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** Renders children into <body>, so dialogs keep working even when an ancestor has a CSS transform. */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
