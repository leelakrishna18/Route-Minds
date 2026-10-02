import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const ApsrtcLogo: React.FC<LogoProps> = ({ className = "w-10 h-10", size = 40 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      <circle cx="50" cy="50" r="48" fill="#0F3E76" stroke="#1E7E34" strokeWidth="4" />
      <rect x="25" y="32" width="50" height="34" rx="6" fill="#FFFFFF" />
      <rect x="29" y="37" width="18" height="13" rx="2" fill="#0F3E76" />
      <rect x="53" y="37" width="18" height="13" rx="2" fill="#0F3E76" />
      <circle cx="37" cy="59" r="4" fill="#D32F2F" />
      <circle cx="63" cy="59" r="4" fill="#D32F2F" />
      <circle cx="34" cy="68" r="6" fill="#1E293B" />
      <circle cx="66" cy="68" r="6" fill="#1E293B" />
      <text x="50" y="24" fontFamily="sans-serif" fontWeight="bold" fontSize="10" fill="#FFFFFF" textAnchor="middle">
        APSRTC
      </text>
      <text x="50" y="88" fontFamily="sans-serif" fontWeight="bold" fontSize="7" fill="#F4F7FB" textAnchor="middle">
        ANDHRA PRADESH
      </text>
    </svg>
  );
};
