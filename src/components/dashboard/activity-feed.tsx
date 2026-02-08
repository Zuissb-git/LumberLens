import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Clock } from "lucide-react";

interface Activity {
  type: string;
  description: string;
  timestamp: string;
  linkHref: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const iconMap: Record<string, typeof Package> = {
  build_order: Package,
  price_submission: DollarSign,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-400 text-center py-4">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, i) => {
            const Icon = iconMap[activity.type] ?? Clock;
            return (
              <Link
                key={i}
                href={activity.linkHref}
                className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-3.5 w-3.5 text-stone-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 truncate">{activity.description}</p>
                  <p className="text-xs text-stone-400">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
