"use client";

import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for exploring Vero",
    features: [
      "Up to 5 projects",
      "Basic AI generation",
      "Community support",
      "Standard response time",
    ],
    buttonText: "Current Plan",
    current: true,
  },
  {
    name: "Pro",
    price: "$20",
    description: "Advanced features for professionals",
    features: [
      "Unlimited projects",
      "Priority AI generation",
      "Early access to new features",
      "Priority support",
      "Advanced code-editing tools",
    ],
    buttonText: "Upgrade to Pro",
    current: false,
    pro: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Scalable solutions for teams",
    features: [
      "Custom AI model training",
      "Dedicated account manager",
      "SLA guarantees",
      "White-label options",
      "Team collaboration tools",
    ],
    buttonText: "Contact Sales",
    current: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-20 px-4 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's right for you and start building with the power of agentic AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "flex flex-col relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 border-2",
              plan.pro ? "border-primary shadow-lg scale-105 z-10" : "border-border"
            )}
          >
            {plan.pro && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg text-sm font-bold">
                RECOMMENDED
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground ml-2">/month</span>}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckIcon className="size-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 text-lg font-semibold" 
                variant={plan.pro ? "default" : "outline"}
                disabled={plan.current}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-20 text-center p-8 rounded-3xl bg-muted/50 border border-border">
        <h2 className="text-2xl font-bold mb-4">Have questions?</h2>
        <p className="text-muted-foreground mb-6">
          Check out our FAQ or get in touch with our team for more information.
        </p>
        <Button variant="link" className="text-lg">
          View Frequently Asked Questions &rarr;
        </Button>
      </div>
    </div>
  );
}
