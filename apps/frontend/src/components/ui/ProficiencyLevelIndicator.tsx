'use client';

interface ProficiencyLevelIndicatorProps {
  level: 1 | 2 | 3; // 1 for Beginner, 2 for Intermediate, 3 for Advanced
  className?: string;
}

const ProficiencyLevelIndicator: React.FC<ProficiencyLevelIndicatorProps> = ({ 
  level, 
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {/* We create an array of 3 and map over it to render the segments */}
      {[1, 2, 3].map((segment) => (
        <div
          key={segment}
          className={`h-2 w-4 rounded-sm transition-colors duration-200 ${
            segment <= level ? 'bg-teal-500' : 'bg-white/15'
          }`}
        ></div>
      ))}
    </div>
  );
};

export default ProficiencyLevelIndicator;

