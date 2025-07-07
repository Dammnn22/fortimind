
import React from 'react';
import { Award, Shield, Target, BookOpen, Trophy } from 'lucide-react';
import { Badge } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface BadgeDisplayProps {
  badge: Badge;
  achieved: boolean;
}

const IconMap: { [key: string]: React.FC<any> } = {
  Shield,
  Award,
  Target,
  BookOpen,
  Trophy,
  Default: Award,
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badge, achieved }) => {
  const IconComponent = IconMap[badge.icon] || IconMap.Default;
  const { t, currentLanguage } = useLocalization();

  return (
    <div
      className={`p-4 border rounded-lg flex flex-col items-center text-center transition-all duration-300
                  ${achieved 
                    ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 text-white shadow-lg dark:from-yellow-500 dark:via-amber-600 dark:to-orange-700' 
                    : 'bg-neutral-light dark:bg-slate-700 border-neutral dark:border-slate-600 opacity-60'}`}
    >
      <IconComponent size={40} className={achieved ? "mb-2" : "mb-2 text-neutral dark:text-slate-500"} />
      <h3 className={`font-semibold text-md ${achieved ? '' : 'text-neutral-dark dark:text-neutral-light'}`}>{badge.name}</h3>
      <p className={`text-xs mt-1 ${achieved ? 'text-white/80' : 'text-neutral-dark/70 dark:text-neutral-light/70'}`}>
        {badge.description}
      </p>
      {achieved && badge.achievedDate && (
        <p className="text-xs mt-2 text-white/70">
          {t('achievedOn')} {new Date(badge.achievedDate).toLocaleDateString(currentLanguage)}
        </p>
      )}
    </div>
  );
};

export default BadgeDisplay;
