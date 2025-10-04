import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, Users } from 'lucide-react';

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    sessionsPerWeek: number;
    estimatedTime: number;
    tags: string[];
  };
  onSelect?: (planId: string) => void;
  onEdit?: (planId: string) => void;
}

export function PlanCard({ plan, onSelect, onEdit }: PlanCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {plan.description}
            </CardDescription>
          </div>
          <Badge className={difficultyColors[plan.difficulty]}>
            {plan.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{plan.duration} 周</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{plan.estimatedTime} 分钟/次</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>{plan.sessionsPerWeek} 次/周</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{plan.category}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {plan.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={() => onSelect?.(plan.id)}
            className="flex-1"
          >
            选择计划
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onEdit?.(plan.id)}
          >
            编辑
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}



