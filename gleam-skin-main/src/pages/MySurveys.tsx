import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Share2,
  BarChart3,
  PlusCircle,
  Mail,
  Copy,
  X,
  Loader2,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const MySurveys = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [sharingSurvey, setSharingSurvey] = useState<any>(null);
  const { toast } = useToast();

  // Email Sharing State
  const [emailRecipients, setEmailRecipients] = useState("");
  const [accessType, setAccessType] = useState("public"); // 'public' | 'restricted'
  const [selectedDomain, setSelectedDomain] = useState("@namal.edu.pk");
  const [isSending, setIsSending] = useState(false);

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

  const handleShare = (survey: any) => {
    setSharingSurvey(survey);
    // Reset sharing state
    setEmailRecipients("");
    setAccessType("public");
    setSelectedDomain("@namal.edu.pk");
  };

  const copyToClipboard = () => {
    if (!sharingSurvey) return;

    // Construct public URL (assuming frontend runs on port 8080)
    const publicUrl = `${window.location.protocol}//${window.location.hostname}:8080/survey/${sharingSurvey.id}`;

    navigator.clipboard.writeText(publicUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "Survey link copied to clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    });
  };

  const handleSendInvites = async () => {
    if (!emailRecipients.trim()) {
      toast({
        title: "No recipients",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    const emails = emailRecipients.split(',').map(e => e.trim()).filter(e => e);

    // Basic validation
    if (emails.length === 0) {
      toast({
        title: "Invalid emails",
        description: "Please enter valid email addresses.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Assuming backend is at localhost:8000
      const response = await fetch(`http://localhost:8000/api/surveys/${sharingSurvey.id}/send_invite/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          domain_restriction: accessType,
          allowed_domain: accessType === 'restricted' ? selectedDomain : null
        }),
      });

      if (!response.ok) throw new Error("Failed to send invites");

      const result = await response.json();

      toast({
        title: "Invites Sent!",
        description: `Successfully sent invites to ${emails.length} recipients.`,
      });

      setSharingSurvey(null); // Close dialog
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Error sending invites",
        description: "There was a problem sending the emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

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

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Surveys</p>
                <h3 className="text-2xl font-bold">{surveys.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                <h3 className="text-2xl font-bold">
                  {surveys.reduce((acc: number, curr: any) => acc + (curr.response_count || 0), 0)}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Response Rate</p>
                <h3 className="text-2xl font-bold">
                  {surveys.length > 0
                    ? Math.round(surveys.reduce((acc: number, curr: any) => acc + (curr.response_count || 0), 0) / surveys.length)
                    : 0}
                </h3>
              </div>
            </CardContent>
          </Card>
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
                        <DropdownMenuItem onClick={() => navigate(`/editor/${survey.id}`, { state: { surveyData: survey } })}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(survey)}>
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
                      {survey.status || 'Active'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {survey.questions?.length || 0} questions
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleShare(survey)}>
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
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

        {/* Share Dialog */}
        <Dialog open={!!sharingSurvey} onOpenChange={(open) => !open && setSharingSurvey(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Survey</DialogTitle>
              <DialogDescription>
                Distribute your survey via link or email invitation.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="link" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link">Public Link</TabsTrigger>
                <TabsTrigger value="email">Email Invite</TabsTrigger>
              </TabsList>

              <TabsContent value="link" className="space-y-4 py-4">
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">
                      Link
                    </Label>
                    <Input
                      id="link"
                      defaultValue={sharingSurvey ? `${window.location.protocol}//${window.location.hostname}:8080/survey/${sharingSurvey.id}` : ''}
                      readOnly
                    />
                  </div>
                  <Button type="submit" size="sm" className="px-3" onClick={copyToClipboard}>
                    <span className="sr-only">Copy</span>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view and fill out the survey.
                </p>
              </TabsContent>

              <TabsContent value="email" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <Textarea
                    placeholder="Enter email addresses (comma separated)"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                    className="resize-none min-h-[80px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Access Control</Label>
                  <RadioGroup value={accessType} onValueChange={setAccessType} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public" className="font-normal cursor-pointer">
                        Public (Any email address)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="restricted" id="restricted" />
                      <Label htmlFor="restricted" className="font-normal cursor-pointer">
                        Restricted (Specific Domain)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {accessType === "restricted" && (
                  <div className="pl-6 space-y-2 animate-fade-in">
                    <Label>Allowed Domain</Label>
                    <Select value={selectedDomain} onValueChange={setSelectedDomain} >
                      <SelectTrigger>
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="@namal.edu.pk">@namal.edu.pk (Namal University)</SelectItem>
                        <SelectItem value="@gmail.com">@gmail.com (Google Accounts)</SelectItem>
                        <SelectItem value="custom">Custom (Type below)</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedDomain === "custom" && (
                      <Input
                        placeholder="@example.com"
                        className="mt-2"
                      />
                    )}
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-primary"
                  onClick={handleSendInvites}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invites
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default MySurveys;
