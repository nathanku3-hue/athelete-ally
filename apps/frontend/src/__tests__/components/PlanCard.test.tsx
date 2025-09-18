import { render, screen, fireEvent } from '@testing-library/react';
import { PlanCard } from '@/components/training/PlanCard';

const mockPlan = {
  id: '1',
  name: '测试训练计划',
  description: '这是一个测试训练计划',
  duration: 12,
  difficulty: 'intermediate' as const,
  category: '力量训练',
  sessionsPerWeek: 3,
  estimatedTime: 60,
  tags: ['力量', '增肌'],
};

describe('PlanCard', () => {
  it('renders plan information correctly', () => {
    render(<PlanCard plan={mockPlan} />);
    
    expect(screen.getByText('测试训练计划')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试训练计划')).toBeInTheDocument();
    expect(screen.getByText('12 周')).toBeInTheDocument();
    expect(screen.getByText('60 分钟/次')).toBeInTheDocument();
    expect(screen.getByText('3 次/周')).toBeInTheDocument();
    expect(screen.getByText('力量训练')).toBeInTheDocument();
  });

  it('calls onSelect when select button is clicked', () => {
    const mockOnSelect = jest.fn();
    render(<PlanCard plan={mockPlan} onSelect={mockOnSelect} />);
    
    fireEvent.click(screen.getByText('选择计划'));
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<PlanCard plan={mockPlan} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('编辑'));
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });

  it('displays difficulty badge with correct styling', () => {
    render(<PlanCard plan={mockPlan} />);
    
    const difficultyBadge = screen.getByText('intermediate');
    expect(difficultyBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('renders all tags', () => {
    render(<PlanCard plan={mockPlan} />);
    
    expect(screen.getByText('力量')).toBeInTheDocument();
    expect(screen.getByText('增肌')).toBeInTheDocument();
  });
});



