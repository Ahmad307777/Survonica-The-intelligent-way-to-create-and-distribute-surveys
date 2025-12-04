import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Share2,
  BarChart3,
  PlusCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const MySurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const data = await api.getSurveys();
        setSurveys(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch surveys",
          variant: "destructive",
        });
      }
    };
    fetchSurveys();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Space_Grotesk']">My Surveys</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your surveys
            </p>
          </div>
          <Link to="/create">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Survey
            </Button>
          </Link>
        </div>

        {surveys.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No surveys yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first AI-powered survey and start collecting valuable insights from your audience.
              </p>
              <Link to="/create">
                <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Your First Survey
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Surveys List */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey: any, index: number) => (
              <Card key={index} className="hover:shadow-elegant transition-all group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1">{survey.title}</h3>
                        <p className="text-sm text-muted-foreground">{survey.responses} responses</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover z-50">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={survey.status === "active" ? "default" : "secondary"}>
                      {survey.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {survey.questions} questions
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-primary hover:opacity-90">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Results
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MySurveys;
