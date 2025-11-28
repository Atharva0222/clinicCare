import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Bed, Ambulance, Heart, Clock, Users, Stethoscope, Pill, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const PatientHomePage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const patientFeatures = [
    {
      icon: Calendar,
      title: t('home.bookAppointment'),
      description: t('home.patientAppointmentsDesc'),
      link: "/patient",
      color: "text-primary",
    },
    {
      icon: FileText,
      title: t('home.myAppointments'),
      description: "View your appointment history and status",
      link: "/patient",
      color: "text-blue-600",
    },
    {
      icon: Pill,
      title: t('home.pharmacy'),
      description: t('home.pharmacyDesc'),
      link: "/pharmacy",
      color: "text-success",
    },
    {
      icon: Bed,
      title: t('home.bedManagement'),
      description: t('home.bedManagementDesc'),
      link: "/beds",
      color: "text-accent",
    },
    {
      icon: Ambulance,
      title: t('home.emergencyAmbulance'),
      description: t('home.emergencyAmbulanceDesc'),
      link: "/ambulance",
      color: "text-urgent",
    },
  ];

  const stats = [
    { icon: Users, label: t('home.patientsServed'), value: "10,000+", color: "text-primary" },
    { icon: Stethoscope, label: t('home.expertDoctors'), value: "5+", color: "text-secondary" },
    { icon: Bed, label: t('home.hospitalBeds'), value: "20", color: "text-accent" },
    { icon: Clock, label: t('home.service247'), value: t('home.always'), color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Heart className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('home.welcomeBack')}, {user?.name}!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/patient">
              <Button size="lg" className="gap-2">
                <Calendar className="h-5 w-5" />
                {t('home.bookAppointment')}
              </Button>
            </Link>
            <Link to="/ambulance">
              <Button size="lg" variant="outline" className="gap-2">
                <Ambulance className="h-5 w-5" />
                {t('home.emergencyAmbulance')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Patient Features */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">{t('home.ourServices')}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patientFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} to={feature.link}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="mb-2">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Key Features */}
        <Card className="mt-16 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">{t('home.smartQueue')}</CardTitle>
            <CardDescription className="text-center">
              {t('home.smartQueueDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-urgent mb-2">1{t('home.priority1')}</div>
                <p className="text-sm font-medium">{t('home.urgencyLevel')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.criticalCases')}</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-2">2{t('home.priority2')}</div>
                <p className="text-sm font-medium">{t('home.seniorCitizens')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.age60Plus')}</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">3{t('home.priority3')}</div>
                <p className="text-sm font-medium">{t('home.appointmentTime')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('home.earlierSlots')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientHomePage;
