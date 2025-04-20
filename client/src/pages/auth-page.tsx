import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/i18n";
import { Lock, Shield } from "lucide-react";
import { Redirect } from "wouter";
import { useLanguage } from "@/context/language-context";
import { useTheme } from "@/context/theme-context";
import TopBar from "@/components/top-bar";
import { useToast } from "@/hooks/use-toast";

// Single schema for both login and signup
const authSchema = insertUserSchema.extend({
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100)
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect to chat if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  // Single form for both login and registration
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle unified auth submit - try login first, register if user doesn't exist
  async function onSubmit(values: z.infer<typeof authSchema>) {
    setIsProcessing(true);
    
    try {
      // Try to login first
      await loginMutation.mutateAsync({
        username: values.username,
        password: values.password,
      });
    } catch (error: any) {
      // If login fails with "user not found", try to register
      if (error.message?.includes("credentials") || error.message?.includes("not found")) {
        try {
          await registerMutation.mutateAsync({
            username: values.username,
            password: values.password,
          });
          toast({
            title: t("auth.accountCreated"),
            description: t("auth.welcomeMessage"),
          });
        } catch (registerError: any) {
          toast({
            title: t("auth.error"),
            description: registerError.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: t("auth.error"),
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col">
      <div className="container max-w-screen-sm px-4 flex-grow flex items-center justify-center py-8">
        <Card className="w-full border-none shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">
              {t("auth.secureMessaging")}
            </CardTitle>
            <CardDescription className="text-sm max-w-md mx-auto">
              {t("auth.enterCredentials")}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.username")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("auth.usernamePlaceholder")} 
                          {...field}
                          className="h-11" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.password")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder={t("auth.passwordPlaceholder")} 
                          {...field}
                          className="h-11" 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {t("auth.passwordHashNotice")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-11 font-medium mt-2" 
                  disabled={isProcessing || loginMutation.isPending || registerMutation.isPending}
                >
                  {isProcessing ? t("auth.authenticating") : t("auth.continueSecurely")}
                </Button>
              </form>
            </Form>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs" 
                onClick={toggleLanguage}
              >
                {language === "en" ? "Türkçe" : "English"}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleTheme} 
                className="text-xs"
              >
                {theme === "light" ? t("common.darkMode") : t("common.lightMode")}
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {t("auth.securityNotice")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
