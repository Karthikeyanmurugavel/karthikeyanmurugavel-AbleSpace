import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

export default function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
}: StatCardProps) {
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center">
          <div
            className={`flex-shrink-0 rounded-md p-3 ${iconBgColor}`}
          >
            {React.cloneElement(icon as React.ReactElement, {
              className: `h-5 w-5 ${iconColor}`,
            })}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd className="flex items-center">
                <div className="text-lg font-semibold text-neutral-900">{value}</div>
                {trend && (
                  <span
                    className={`ml-2 flex items-center text-sm ${
                      trend.direction === "up"
                        ? "text-success-500"
                        : "text-destructive"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path
                        d={
                          trend.direction === "up"
                            ? "M12 19V5M5 12l7-7 7 7"
                            : "M12 5v14M5 12l7 7 7-7"
                        }
                      />
                    </svg>
                    {trend.value}%
                  </span>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Card>
  );
}
