import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Calendar, 
  BarChart2, 
  Menu, 
  LogOut,
  Settings,
  X 
} from "lucide-react";
import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMobile } from "@/hooks/use-mobile";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMobile();

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: "Overview of your tasks and activity"
    },
    {
      name: "My Tasks",
      href: "/my-tasks",
      icon: <CheckSquare className="w-5 h-5" />,
      description: "View and manage your assigned tasks"
    },
    {
      name: "Team",
      href: "/team",
      icon: <Users className="w-5 h-5" />,
      description: "Collaborate with your team members"
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: <Calendar className="w-5 h-5" />,
      description: "Schedule and manage task deadlines"
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <BarChart2 className="w-5 h-5" />,
      description: "View performance analytics and metrics"
    },
  ];

  return (
    <>
      <div className={cn(
        "bg-gradient-to-b from-background to-background border-r border-border w-full md:w-64 md:flex md:flex-col md:fixed md:inset-y-0 z-30 transition-all duration-300 ease-in-out dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950",
        mobileOpen ? "fixed inset-0" : "hidden md:flex"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-6 border-b border-border">
            <div className="flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600 text-2xl font-bold dark:from-primary-400 dark:to-blue-400">TaskFlow</span>
            </div>
            <button 
              type="button" 
              className="md:hidden rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-3 space-y-2">
              <TooltipProvider>
                {navItems.map((item) => (
                  <Tooltip key={item.href} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <a
                          className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 group",
                            location === item.href
                              ? "bg-primary-100/50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                              : "text-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          <span className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-md mr-3 transition-colors",
                            location === item.href
                              ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                              : "bg-accent text-muted-foreground group-hover:bg-accent/70 group-hover:text-foreground"
                          )}>
                            {React.cloneElement(item.icon, {
                              className: "w-5 h-5",
                            })}
                          </span>
                          <span>{item.name}</span>
                        </a>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="hidden md:block">
                      <p>{item.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </nav>
          </div>

          <div className="border-t border-border p-4 mt-auto">
            <div className="flex items-center bg-accent/50 dark:bg-accent/30 p-3 rounded-lg">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                  {user?.name?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Team Member</p>
              </div>
              <div className="ml-auto flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/70"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Log out</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 right-4 z-20">
        <Button 
          variant="outline" 
          size="icon"
          className={cn(
            "rounded-full bg-background shadow-md border-border",
            mobileOpen && "hidden"
          )}
          onClick={toggleMobileMenu}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay when mobile menu is open */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden dark:bg-black/50"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}
