'use client';
import dynamic from 'next/dynamic';

const ImportWizard = dynamic(() => import('./import-wizard'), { ssr: false });

export default function Page() {
  return <ImportWizard />;
}
