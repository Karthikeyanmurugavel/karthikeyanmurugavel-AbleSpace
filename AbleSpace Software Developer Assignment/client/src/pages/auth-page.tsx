import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password must contain at least one number and one special character"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Define forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submissions
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-xl overflow-hidden bg-white">
        {/* Left column - Auth form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col">
          <div className="mb-8 flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-r from-primary-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">TF</div>
            <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-blue-700">TaskFlow</h1>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">
              {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-neutral-500 mb-6">
              {activeTab === 'login' 
                ? 'Sign in to access your tasks and projects' 
                : 'Join TaskFlow to start managing your tasks efficiently'}
            </p>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-6 bg-neutral-100">
                <TabsTrigger value="login" className="w-1/2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="w-1/2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your username" 
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Password</FormLabel>
                            <a
                              href="#"
                              className="text-xs text-primary-600 hover:text-primary-500"
                            >
                              Forgot password?
                            </a>
                          </div>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              placeholder="Enter your password"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-11 mt-6 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 transition-all duration-200"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign in"}
                    </Button>
                    
                    <div className="mt-6 text-center">
                      <p className="text-sm text-neutral-500">
                        Don't have an account?{" "}
                        <button 
                          type="button" 
                          onClick={() => setActiveTab("register")}
                          className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                          Create one now
                        </button>
                      </p>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your full name" className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Choose a username" className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              placeholder="Create a password"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-neutral-500 mt-1">
                            Password must be at least 6 characters with at least one 
                            number and one special character.
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              placeholder="Confirm your password"
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-11 mt-6 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 transition-all duration-200"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending
                        ? "Creating Account..."
                        : "Create Account"}
                    </Button>
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-neutral-500">
                        Already have an account?{" "}
                        <button 
                          type="button" 
                          onClick={() => setActiveTab("login")}
                          className="text-primary-600 hover:text-primary-500 font-medium"
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-auto pt-6">
            <p className="text-xs text-center text-neutral-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Right column - Hero content */}
        <div className="hidden md:block w-1/2 bg-gradient-to-br from-primary-600 to-blue-700 text-white p-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Streamline Your Task Management</h2>
            <p className="text-lg mb-8 text-primary-100">
              TaskFlow helps teams organize, track, and manage work efficiently.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1 bg-primary-500 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Task Management</h3>
                  <p className="text-primary-100 text-sm mt-1">Create, assign and track tasks with ease</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1 bg-primary-500 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Team Collaboration</h3>
                  <p className="text-primary-100 text-sm mt-1">Work together with your team in real-time</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 p-1 bg-primary-500 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Progress Tracking</h3>
                  <p className="text-primary-100 text-sm mt-1">Monitor project progress with visual dashboards</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="white" d="M44.9,-76.2C59.7,-69.2,74.4,-60.2,83.1,-46.4C91.8,-32.7,94.4,-14.2,91.8,2.6C89.3,19.4,81.6,34.7,71.5,48.3C61.4,61.9,48.8,73.8,34.1,79.3C19.4,84.7,2.6,83.6,-14.2,80.2C-31,76.8,-47.8,70.9,-62.2,60C-76.6,49,-88.7,32.8,-92.7,14.7C-96.6,-3.4,-92.3,-23.4,-83.1,-40.5C-73.9,-57.6,-59.7,-71.8,-44,-78.8C-28.2,-85.9,-11.1,-85.8,2.4,-89.7C15.9,-93.6,30.1,-83.2,44.9,-76.2Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
