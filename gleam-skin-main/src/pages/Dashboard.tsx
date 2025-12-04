import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  PlusCircle, 
  FileText, 
  Users, 
  TrendingUp,
  ArrowRight,
  Clock
} from "lucide-react";

const Dashboard = () => {
  // Mock data - will be replaced with real data from backend
  const stats = [
    {
      title: "Total Surveys",
      value: "0",
      icon: FileText,
      description: "All time",
      trend: "+0%"
    },
    {
      title: "Total Responses",
      value: "0",
      icon: Users,
      description: "Across all surveys",
      trend: "+0%"
    },
    {
      title: "Response Rate",
      value: "0%",
      icon: TrendingUp,
      description: "Average completion",
      trend: "0%"
    },
    {
      title: "Active Surveys",
      value: "0",
      icon: Clock,
      description: "Currently live",
      trend: "0"
    }
  ];

  const recentSurveys = [];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk']">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your surveys.
            </p>
          </div>
          <Link to="/create">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Survey
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-elegant transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                    <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Surveys / Empty State */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Surveys</CardTitle>
            <CardDescription>Your recently created or modified surveys</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSurveys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Get started by creating your first AI-powered survey. It only takes a few minutes!
                </p>
                <Link to="/create">
                  <Button className="bg-gradient-primary hover:opacity-90 transition-opacity group">
                    Create Your First Survey
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Survey list will go here */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-primary text-primary-foreground border-0">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Learn how to make the most of Survonica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  Create your first survey with AI
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  Customize questions and design
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  Share and collect responses
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Resources to help you get the most out of Survonica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between">
                View Documentation
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Watch Tutorial Videos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
