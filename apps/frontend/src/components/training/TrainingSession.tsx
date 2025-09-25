import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Play, Pause, RotateCcw } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  weight: string;
  notes?: string;
  completed: boolean;
}

interface TrainingSessionProps {
  session: {
    id: string;
    planId: string;
    weekNumber: number;
    dayOfWeek: number;
    name: string;
    duration: number;
    exercises: Exercise[];
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    startedAt?: string;
    completedAt?: string;
  };
  onStart?: (sessionId: string) => void;
  onPause?: (sessionId: string) => void;
  onComplete?: (sessionId: string) => void;
  onReset?: (sessionId: string) => void;
  onCompleteExercise?: (sessionId: string, exerciseId: string) => void;
}

export function TrainingSession({ 
  session, 
  onStart, 
  onPause, 
  onComplete, 
  onReset,
  onCompleteExercise 
}: TrainingSessionProps) {
  const completedExercises = session.exercises.filter(ex => ex.completed).length;
  const totalExercises = session.exercises.length;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in_progress': return '进行中';
      case 'skipped': return '已跳过';
      default: return '待开始';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{session.name}</CardTitle>
            <CardDescription>
              第 {session.weekNumber} 周，第 {session.dayOfWeek} 天
            </CardDescription>
          </div>
          <Badge className={getStatusColor(session.status)}>
            {getStatusText(session.status)}
          </Badge>
        </div>
        
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>进度</span>
            <span>{completedExercises}/{totalExercises} 个动作</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 动作列表 */}
        <div className="space-y-3">
          <h4 className="font-medium">训练动作</h4>
          {session.exercises.map((exercise) => (
            <div 
              key={exercise.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                exercise.completed ? 'bg-green-50 border-green-200' : 'bg-card'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium">{exercise.name}</h5>
                  <Badge variant="outline" className="text-xs">
                    {exercise.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {exercise.sets} 组 × {exercise.reps} 次
                  {exercise.weight && ` @ ${exercise.weight}kg`}
                </p>
                {exercise.notes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {exercise.notes}
                  </p>
                )}
              </div>
              
              <Button
                variant={exercise.completed ? "outline" : "default"}
                size="sm"
                onClick={() => onCompleteExercise?.(session.id, exercise.id)}
                className="ml-2"
              >
                {exercise.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
        
        {/* 控制按钮 */}
        <div className="flex space-x-2 pt-4 border-t">
          {session.status === 'pending' && (
            <Button onClick={() => onStart?.(session.id)} className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              开始训练
            </Button>
          )}
          
          {session.status === 'in_progress' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => onPause?.(session.id)}
                className="flex-1"
              >
                <Pause className="mr-2 h-4 w-4" />
                暂停
              </Button>
              <Button 
                onClick={() => onComplete?.(session.id)}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                完成
              </Button>
            </>
          )}
          
          {session.status === 'completed' && (
            <Button 
              variant="outline" 
              onClick={() => onReset?.(session.id)}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              重新开始
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



