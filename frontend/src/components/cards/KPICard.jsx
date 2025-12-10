import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'from-secondary/50 to-secondary/20',
  primary: 'from-primary/20 to-primary/5',
  success: 'from-success/20 to-success/5',
  warning: 'from-warning/20 to-warning/5',
};

const iconVariantStyles = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'gradient-bg text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  index = 0,
  variant = 'default',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn('kpi-card bg-gradient-to-br', variantStyles[variant])}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-display font-bold tracking-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl shadow-lg',
              iconVariantStyles[variant]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-1 text-sm">
            <span
              className={cn(
                'font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
