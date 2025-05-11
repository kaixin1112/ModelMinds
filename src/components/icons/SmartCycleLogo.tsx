import type { SVGProps } from 'react';

export default function SmartCycleLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5" // Adjusted stroke width for a cleaner look
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Outer gear shape suggesting 'smart' or 'technology' */}
      <path d="M12 2a10 10 0 00-3.536 19.364M12 22a10 10 0 003.536-19.364" />
      <path d="M12 4a8 8 0 00-2.828 15.07M12 20a8 8 0 002.828-15.07" />
      
      <circle cx="12" cy="12" r="3" strokeWidth="1.5"/>

      {/* Simplified recycling arrows within the gear */}
      {/* Arrow 1 */}
      <path d="M10.5 9.5 A3.5 3.5 0 0 1 12 8.05" />
      <path d="M12 8.05 L11.2 7.5 M12 8.05 L12.5 7.2" />
      
      {/* Arrow 2 */}
      <path d="M13.5 14.5 A3.5 3.5 0 0 1 12 15.95" />
      <path d="M12 15.95 L12.8 16.5 M12 15.95 L11.5 16.8" />

      {/* Arrow 3 - connecting and completing the cycle */}
      <path d="M14.2 11.2 A3.5 3.5 0 0 1 9.8 12.8" />
      <path d="M9.8 12.8 L9 12.3 M9.8 12.8 L10.3 13.6" />
    </svg>
  );
}
