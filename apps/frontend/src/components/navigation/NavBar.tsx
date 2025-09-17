'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Calendar, Target, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '首页', href: '/', icon: Home },
  { name: '训练计划', href: '/training/plans', icon: Target },
  { name: '训练会话', href: '/training/sessions', icon: Calendar },
  { name: '进度', href: '/progress', icon: BarChart3 },
  { name: '设置', href: '/settings', icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Athlete Ally</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'flex items-center space-x-2',
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}



