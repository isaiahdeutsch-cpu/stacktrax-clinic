import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Subscription {
  tier: string
  status: string
  seat_count: number
  max_patients: number | null
  trial_ends_at: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export function BillingSettings({ subscription }: { subscription: Subscription | null }) {
  if (!subscription) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No subscription found.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Billing & Subscription</CardTitle>
        <CardDescription>Manage your clinic subscription.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="text-lg font-semibold capitalize">{subscription.tier}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge
              variant={
                subscription.status === 'active' || subscription.status === 'trialing'
                  ? 'default'
                  : 'destructive'
              }
            >
              {subscription.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Seats</p>
            <p className="font-medium">{subscription.seat_count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Max Patients</p>
            <p className="font-medium">{subscription.max_patients ?? 'Unlimited'}</p>
          </div>
          {subscription.trial_ends_at && (
            <div>
              <p className="text-sm text-muted-foreground">Trial Ends</p>
              <p className="font-medium">
                {new Date(subscription.trial_ends_at).toLocaleDateString()}
              </p>
            </div>
          )}
          {subscription.current_period_end && (
            <div>
              <p className="text-sm text-muted-foreground">Period End</p>
              <p className="font-medium">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        {subscription.cancel_at_period_end && (
          <p className="text-sm text-destructive">
            Subscription will cancel at the end of the current billing period.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
