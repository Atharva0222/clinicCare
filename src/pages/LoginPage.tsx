import { useState } from "react";
import { useAuth, UserRole, SignupData } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, User, Heart } from "lucide-react";
import { toast } from "sonner";

const LoginPage = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>("patient");
  const { login, signup } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signin") {
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      setIsLoading(true);

      try {
        const success = await login(email, password);

        if (success) {
          toast.success(`Welcome back!`);
        } else {
          toast.error("Invalid email or password");
        }
      } catch (error) {
        toast.error("An error occurred during login");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Signup mode
      if (!fullName || !email || !phone || !password || !confirmPassword) {
        toast.error("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      setIsLoading(true);

      try {
        const signupData: SignupData = {
          name: fullName,
          email,
          phone,
          password,
          role: activeTab,
        };

        const result = await signup(signupData);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("An error occurred during signup");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Heart className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('login.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('login.subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{mode === "signin" ? t('login.signin') : t('login.signup')}</CardTitle>
            <CardDescription>
              {t('login.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserRole)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient" className="gap-2">
                  <User className="h-4 w-4" />
                  {t('login.patient')}
                </TabsTrigger>
                <TabsTrigger value="doctor" className="gap-2">
                  <Stethoscope className="h-4 w-4" />
                  {t('login.doctor')}
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-6">
                <div className="space-y-4">
                  {mode === "signup" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">{t('login.fullName')}</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder={t('login.fullName')}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('login.phone')}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder={t('login.phone')}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('login.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={`${activeTab}@example.com`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('login.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('login.password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {mode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('login.confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder={t('login.confirmPassword')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  <TabsContent value="patient" className="mt-0">
                    <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                      <p className="font-semibold mb-1">{t('login.patientAccess')}</p>
                      <p>{t('login.patientDesc')}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="doctor" className="mt-0">
                    <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                      <p className="font-semibold mb-1">{t('login.doctorAccess')}</p>
                      <p>{t('login.doctorDesc')}</p>
                    </div>
                  </TabsContent>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? (mode === "signin" ? t('login.signingIn') : t('login.signingUp'))
                      : (mode === "signin" ? t('login.signinButton') : t('login.signupButton'))
                    }
                  </Button>

                  <div className="text-center text-sm">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        setMode(mode === "signin" ? "signup" : "signin");
                        setEmail("");
                        setPassword("");
                        setConfirmPassword("");
                        setFullName("");
                        setPhone("");
                      }}
                      disabled={isLoading}
                    >
                      {mode === "signin" ? t('login.noAccount') : t('login.haveAccount')}
                    </Button>
                  </div>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>{t('login.sessionExpiry')}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
