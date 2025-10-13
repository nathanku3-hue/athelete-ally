import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TimeCrunchModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (minutes: number) => void;
  defaultMinutes?: number;
}

const QUICK_OPTIONS = [20, 30, 45, 60];

export function TimeCrunchModal({ open, onClose, onSubmit, defaultMinutes = 30 }: TimeCrunchModalProps) {
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMinutes(defaultMinutes);
      setError(null);
    }
  }, [open, defaultMinutes]);

  const handleSubmit = () => {
    if (!Number.isFinite(minutes) || minutes < 10) {
      setError('請輸入至少 10 分鐘的訓練時間');
      return;
    }

    if (minutes > 180) {
      setError('訓練時長不可超過 180 分鐘');
      return;
    }

    onSubmit(Math.round(minutes));
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Short on Time?</DialogTitle>
          <DialogDescription>
            輸入你今天可以投入的訓練時間，AI 會自動幫你壓縮課表，同時保留核心動作。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">可用時間 (分鐘)</label>
            <Input
              type="number"
              min={10}
              max={180}
              value={minutes}
              onChange={(event) => {
                setMinutes(Number(event.target.value));
                setError(null);
              }}
              className="mt-2"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">快速選擇</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant={minutes === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setMinutes(option);
                    setError(null);
                  }}
                >
                  {option} 分鐘
                </Button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit}>壓縮課表</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
