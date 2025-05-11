import type { SVGProps } from 'react';

export default function GlassIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2h8" />
      <path d="M7 2v4.94C7 7.52 7.5 8 8.06 8h7.89c.56 0 1.05-.48.99-1.06V2" />
      <path d="M7 9.01V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9" />
    </svg>
  );
}
