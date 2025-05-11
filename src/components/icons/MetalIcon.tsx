import type { SVGProps } from 'react';

export default function MetalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
      <line x1="7" y1="6" x2="17" y2="6" />
      <line x1="7" y1="18" x2="17" y2="18" />
    </svg>
  );
}
