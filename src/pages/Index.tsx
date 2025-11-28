import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Activity, Bed, Ambulance, Heart, Clock, Users, Stethoscope } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Calendar,
      title: "Patient Appointments",
      description: "Book appointments with preferred doctors and time slots",
      link: "/patient",
      color: "text-primary",
    },
    {
      icon: Activity,
      title: "Doctor Dashboard",
      description: "Manage appointments, view smart queue, and patient care",
      link: "/doctor",
      color: "text-secondary",
    },
    {
      icon: Bed,
      title: "Bed Management",
      description: "Real-time bed availability and reservation system",
      link: "/beds",
      color: "text-accent",
    },
    {
      icon: Ambulance,
      title: "Emergency Ambulance",
      description: "Smart dispatch system for nearest ambulance",
      link: "/ambulance",
      color: "text-urgent",
    },
  ];

  const stats = [
    { icon: Users, label: "Patients Served", value: "10,000+", color: "text-primary" },
    { icon: Stethoscope, label: "Expert Doctors", value: "5+", color: "text-secondary" },
    { icon: Bed, label: "Hospital Beds", value: "20", color: "text-accent" },
    { icon: Clock, label: "24/7 Service", value: "Always", color: "text-success" },
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
            ClinicCare Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Smart queue management, emergency services, and seamless patient care coordination
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/patient">
              <Button size="lg" className="gap-2">
                <Calendar className="h-5 w-5" />
                Book Appointment
              </Button>
            </Link>
            <Link to="/doctor">
              <Button size="lg" variant="outline" className="gap-2">
                <Activity className="h-5 w-5" />
                Doctor Portal
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

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => {
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
            <CardTitle className="text-center">Smart Queue Algorithm</CardTitle>
            <CardDescription className="text-center">
              Intelligent prioritization for optimal patient care
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-urgent mb-2">1st</div>
                <p className="text-sm font-medium">Urgency Level</p>
                <p className="text-xs text-muted-foreground mt-1">Critical cases prioritized</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary mb-2">2nd</div>
                <p className="text-sm font-medium">Senior Citizens</p>
                <p className="text-xs text-muted-foreground mt-1">Age 60+ gets priority</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">3rd</div>
                <p className="text-sm font-medium">Appointment Time</p>
                <p className="text-xs text-muted-foreground mt-1">Earlier slots served first</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
