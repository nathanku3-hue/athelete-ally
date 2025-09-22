"use client";

interface PurposeCardProps {
  title: string;
  description: string;
  commitment: string;
  timeCommitment: string;
  isSelected: boolean;
  onClick: () => void;
}

const PurposeCard = ({ 
  title, 
  description, 
  commitment, 
  timeCommitment, 
  isSelected, 
  onClick 
}: PurposeCardProps) => {
  const getCommitmentColor = (commitment: string) => {
    switch (commitment.toLowerCase()) {
      case 'low':
        return 'text-green-400 bg-green-400/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'high':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border-2 p-6 transition-all transform hover:scale-105 ${
        isSelected
          ? "border-blue-500 bg-blue-500/10"
          : "border-gray-700 hover:border-blue-500/50"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCommitmentColor(commitment)}`}>
          {commitment} Commitment
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <div className="flex items-center text-xs text-gray-500">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {timeCommitment}
      </div>
    </div>
  );
};

export default PurposeCard;
