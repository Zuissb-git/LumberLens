import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Pricing — LumberLens",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for occasional DIY projects",
    features: [
      "Basic price search",
      "Up to 3 build orders",
      "Community-submitted prices",
      "Project templates",
    ],
    cta: "Get Started",
    href: "/auth/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious DIYers and small contractors",
    features: [
      "Everything in Free",
      "Unlimited build orders",
      "Price alerts & notifications",
      "Historical price charts",
      "Priority repricing",
      "Export to CSV/PDF",
    ],
    cta: "Start Pro Trial",
    href: "/auth/signup",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "For contractors and construction teams",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared build orders",
      "Vendor API access",
      "Custom price feeds",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "/auth/signup",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-stone-900">Simple, transparent pricing</h1>
        <p className="text-stone-500 mt-2">
          Start free and upgrade as your needs grow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={
              tier.highlighted
                ? "border-green-500 ring-2 ring-green-500 relative"
                : ""
            }
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Most Popular</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-stone-900">{tier.price}</span>
                <span className="text-stone-500 ml-1">{tier.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-stone-600">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={tier.href}>
                <Button
                  variant={tier.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
