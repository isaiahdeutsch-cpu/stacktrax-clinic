import { Badge } from '@/components/ui/badge'

const FLAG_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  normal: 'secondary',
  low: 'outline',
  high: 'outline',
  critical_low: 'destructive',
  critical_high: 'destructive',
}

export function LabFlagBadge({ flag }: { flag: string | null }) {
  if (!flag || flag === 'normal') return <span className="text-xs text-muted-foreground">Normal</span>

  return (
    <Badge variant={FLAG_COLORS[flag] ?? 'outline'} className="text-xs">
      {flag.replace('_', ' ')}
    </Badge>
  )
}
