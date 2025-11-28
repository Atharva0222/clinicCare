import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Activity, Bed, Ambulance, Home, Pill } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/patient", label: "Book Appointment", icon: Calendar },
  { path: "/doctor", label: "Doctor Dashboard", icon: Activity },
  { path: "/pharmacy", label: "Pharmacy", icon: Pill },
  { path: "/beds", label: "Bed Management", icon: Bed },
  { path: "/ambulance", label: "Ambulance", icon: Ambulance },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">ClinicCare</span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn("flex items-center gap-2")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="md:hidden flex items-center">
            <select
              className="px-3 py-2 border rounded-md bg-background"
              value={location.pathname}
              onChange={(e) => window.location.href = e.target.value}
            >
              {navItems.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};
