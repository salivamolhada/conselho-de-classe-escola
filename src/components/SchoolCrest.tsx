import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { SCHOOL_INFO } from '../data/defaultData';

interface SchoolCrestProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SchoolCrest: React.FC<SchoolCrestProps> = ({ size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);

  const dims =
    size === 'lg'
      ? 'w-24 h-24 rounded-2xl'
      : size === 'sm'
        ? 'w-10 h-10 rounded-xl'
        : 'w-12 h-12 rounded-xl';

  if (imgError) {
    return (
      <div
        className={`${dims} bg-gradient-to-br from-red-800 via-slate-900 to-emerald-900 border-2 border-amber-400/70 flex items-center justify-center text-amber-300 shrink-0 shadow-md ${className}`}
      >
        <GraduationCap className={size === 'lg' ? 'w-11 h-11' : 'w-5 h-5'} />
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={SCHOOL_INFO.crestImage}
        alt={`Brasão natalino oficial — ${SCHOOL_INFO.schoolName}`}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${dims} object-cover border-2 border-amber-300/80 shadow-md bg-slate-900`}
      />
    </div>
  );
};
