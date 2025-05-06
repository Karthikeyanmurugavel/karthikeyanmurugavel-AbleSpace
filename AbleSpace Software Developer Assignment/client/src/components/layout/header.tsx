import { useState, useEffect } from "react";
import { Search, Bell, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate, cn } from "@/lib/utils";
import CreateTaskForm from "@/components/tasks/create-task-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  title: string;
  onSearch?: (query: string) => void;
}

export default function Header({ title, onSearch }: HeaderProps) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const isMobile = useMobile();

  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const unreadNotifications = notifications.filter((notif) => !notif.read);
  
  // Effect to mark notifications as read when popover is closed
  useEffect(() => {
    if (!notificationOpen && unreadNotifications.length > 0) {
      // Wait a bit before marking as read to ensure user has seen them
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notificationOpen, unreadNotifications.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiRequest("PUT", `/api/notifications/${id}/read`, {});
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      // This would usually be a batch operation in a real API
      for (const notification of unreadNotifications) {
        await apiRequest("PUT", `/api/notifications/${notification.id}/read`, {});
      }
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <header className="bg-background shadow-sm border-b border-border sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-200 dark:to-gray-400">
          {title}
        </h1>

        <div className="flex items-center space-x-3">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Input
              type="text"
              placeholder="Search tasks..."
              className="w-52 md:w-64 pl-10 pr-4 py-2 bg-accent/50 focus-visible:bg-background transition-colors"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          </form>

          <ThemeToggle iconOnly />
          
          <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-full border-border">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">{unreadNotifications.length}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center">
                  <h4 className="font-medium text-sm">Notifications</h4>
                  {unreadNotifications.length > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-300 dark:hover:bg-primary-900/60">
                      {unreadNotifications.length} new
                    </Badge>
                  )}
                </div>
                {unreadNotifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8 px-2 text-muted-foreground"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-[300px]">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "p-4 hover:bg-accent/50 transition-colors cursor-pointer relative group",
                          !notification.read && 'bg-primary-100/50 dark:bg-primary-900/20'
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm pr-6 text-foreground">{notification.message}</p>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                            >
                              <Check className="h-4 w-4 text-primary-500 dark:text-primary-400" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm">No notifications yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">We'll notify you when something happens</p>
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 transition-all duration-200 dark:from-primary-500 dark:to-blue-500 dark:hover:from-primary-600 dark:hover:to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                {isMobile ? '' : 'New Task'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <CreateTaskForm onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Mobile search */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 bg-accent/50 focus-visible:bg-background transition-colors"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
        </form>
      </div>
    </header>
  );
}
