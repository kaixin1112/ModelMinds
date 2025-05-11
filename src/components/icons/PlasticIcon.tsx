import type { SVGProps } from 'react';

export default function PlasticIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 21h8v-7H8v7Z" />
      <path d="M8 14V8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v6" />
      <path d="M10 4h4" />
      <path d="M10 2h4" />
    </svg>
  );
}
