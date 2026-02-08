import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing } from "lucide-react";

interface AlertsPanelProps {
  activeAlerts: number;
  triggeredAlerts: number;
}

export function AlertsPanel({ activeAlerts, triggeredAlerts }: AlertsPanelProps) {
  if (activeAlerts === 0 && triggeredAlerts === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {triggeredAlerts > 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <BellRing className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  {triggeredAlerts} alert{triggeredAlerts !== 1 ? "s" : ""} triggered!
                </p>
                <p className="text-xs text-green-600">
                  Prices have dropped to your target
                </p>
              </div>
              <Badge className="bg-green-600">{triggeredAlerts}</Badge>
            </div>
          )}
          {activeAlerts > 0 && (
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
              <Bell className="h-5 w-5 text-stone-500" />
              <div className="flex-1">
                <p className="text-sm text-stone-700">
                  {activeAlerts} active alert{activeAlerts !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-stone-500">Monitoring for price drops</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
