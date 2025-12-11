import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import {
  PlusCircle,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  Clock
} from "lucide-react";

// Simple CountUp Component for Animation
const CountUpAnimation = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const data = await api.getSurveys();
        setSurveys(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  // Calculate Real Stats
  const totalSurveys = surveys.length;
  const totalResponses = surveys.reduce((acc: number, curr: any) => acc + (curr.response_count || 0), 0);
  const avgResponseRate = totalSurveys > 0 ? Math.round(totalResponses / totalSurveys) : 0; // Simple avg for now

  // For "Active Surveys", we'll just count all for this MVP as status isn't fully implemented
  const activeSurveys = totalSurveys;

  const stats = [
    {
      title: "Total Surveys",
      value: totalSurveys,
      icon: FileText,
      description: "All time",
      trend: "+100%", // Placeholder trend
      suffix: ""
    },
    {
      title: "Total Responses",
      value: totalResponses,
      icon: Users,
      description: "Across all surveys",
      trend: "+100%",
      suffix: ""
    },
    {
      title: "Avg. Responses",
      value: avgResponseRate,
      icon: TrendingUp,
      description: "Per survey",
      trend: "+100%",
      suffix: ""
    },
    {
      title: "Active Surveys",
      value: activeSurveys,
      icon: Clock,
      description: "Currently live",
      trend: "+100%",
      suffix: ""
    }
  ];

  const recentSurveys = surveys.slice(0, 3); // Top 3 most recent

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
                  <div className="text-3xl font-bold">
                    {loading ? "..." : <CountUpAnimation end={stat.value} suffix={stat.suffix} />}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                    {/* <span className="text-xs text-green-600 font-medium">{stat.trend}</span> */}
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
            {surveys.length === 0 ? (
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
                {recentSurveys.map((survey: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{survey.title}</h4>
                        <p className="text-xs text-muted-foreground">{survey.questions?.length || 0} Questions • Combined Template</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{survey.response_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Responses</p>
                    </div>
                  </div>
                ))}
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
