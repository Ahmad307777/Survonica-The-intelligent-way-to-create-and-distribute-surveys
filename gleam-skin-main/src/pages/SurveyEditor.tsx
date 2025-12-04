import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Eye, 
  Save,
  Settings,
  Share2,
  Copy,
  Check,
  Shield,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  id: string;
  type: string;
  text: string;
  required: boolean;
  options?: string[];
}

const SurveyEditor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [surveyTitle, setSurveyTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [template, setTemplate] = useState<string>("Single Column");
  const [requireQualification, setRequireQualification] = useState(false);
  const [qualificationQuestions, setQualificationQuestions] = useState<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>>([]);
  const [passScore, setPassScore] = useState(80);
  const [saving, setSaving] = useState(false);
  
  // Generate survey link (mock for now)
  const surveyLink = `${window.location.origin}/survey/${Date.now()}`;

  // Load survey data from localStorage on mount
  useEffect(() => {
    const savedSurvey = localStorage.getItem('currentSurvey');
    if (savedSurvey) {
      try {
        const parsed = JSON.parse(savedSurvey);
        setSurveyTitle(parsed.title || "New Survey");
        setTemplate(parsed.template || "Single Column");
        
        // Convert generated questions to editor format
        const editorQuestions = parsed.questions?.map((q: any, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          type: q.type || "text",
          text: q.text,
          required: q.required !== undefined ? q.required : true,
          options: q.options
        })) || [];
        
        setQuestions(editorQuestions);
        
        // Clear localStorage after loading
        localStorage.removeItem('currentSurvey');
      } catch (e) {
        console.error('Failed to load survey:', e);
      }
    } else {
      // Default questions if no saved data
      setSurveyTitle("Customer Satisfaction Survey");
      setQuestions([
        { id: "1", type: "multiple-choice", text: "How satisfied are you with our service?", required: true },
        { id: "2", type: "text", text: "What did you like most?", required: false },
      ]);
    }

    // Load qualification data on mount
    const savedQualification = localStorage.getItem('qualificationData');
    if (savedQualification) {
      try {
        const parsed = JSON.parse(savedQualification);
        setRequireQualification(parsed.requireQualification || false);
        setQualificationQuestions(parsed.qualificationQuestions || []);
        setPassScore(parsed.passScore || 80);
      } catch (e) {
        console.error('Failed to load qualification data:', e);
      }
    }
  }, []);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "text",
      text: "New question",
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSave = async () => {
    if (!surveyTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a survey title",
        variant: "destructive"
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "No questions",
        description: "Please add at least one question",
        variant: "destructive"
      });
      return;
    }

    // Validate qualification questions if enabled
    if (requireQualification) {
      if (qualificationQuestions.length === 0) {
        toast({
          title: "Qualification questions required",
          description: "Please add at least one qualification question",
          variant: "destructive"
        });
        return;
      }

      // Check if all qualification questions are complete
      const incomplete = qualificationQuestions.some(q => 
        !q.question.trim() || q.options.some(opt => !opt.trim())
      );

      if (incomplete) {
        toast({
          title: "Incomplete qualification questions",
          description: "Please fill in all qualification questions and options",
          variant: "destructive"
        });
        return;
      }
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to save surveys",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      // Convert questions to simple format for database
      const questionTexts = questions.map(q => q.text);

      const surveyData = {
        user_id: user.id,
        title: surveyTitle,
        description: "Survey created with AI",
        questions: questionTexts,
        template: template.toLowerCase().replace(/ /g, '-'),
        require_qualification: requireQualification,
        qualification_pass_score: passScore,
      };

      const { data, error } = await supabase
        .from("surveys")
        .insert([surveyData])
        .select()
        .single();

      if (error) throw error;

      // If qualification is required, save the test
      if (requireQualification && data && qualificationQuestions.length > 0) {
        await saveQualificationTest(data.id);
      }

      toast({
        title: "Survey saved!",
        description: "Your survey has been saved successfully.",
      });
      
      navigate("/surveys");
    } catch (error) {
      console.error("Error saving survey:", error);
      toast({
        title: "Error",
        description: "Failed to save survey. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveQualificationTest = async (surveyId: string) => {
    try {
      const { error: testError } = await supabase
        .from("qualification_tests")
        .insert({
          survey_id: surveyId,
          topic: surveyTitle,
          questions: qualificationQuestions,
        });

      if (testError) throw testError;
    } catch (error) {
      console.error("Error saving qualification test:", error);
      toast({
        title: "Warning",
        description: "Survey saved but qualification test save failed",
        variant: "destructive"
      });
    }
  };

  const addQualificationQuestion = () => {
    setQualificationQuestions([...qualificationQuestions, {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }]);
  };

  const updateQualificationQuestion = (index: number, field: string, value: any) => {
    const updated = [...qualificationQuestions];
    if (field === "question") {
      updated[index].question = value;
    } else if (field === "correctAnswer") {
      updated[index].correctAnswer = value;
    }
    setQualificationQuestions(updated);
  };

  const updateQualificationOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...qualificationQuestions];
    updated[qIndex].options[optIndex] = value;
    setQualificationQuestions(updated);
  };

  const removeQualificationQuestion = (index: number) => {
    setQualificationQuestions(qualificationQuestions.filter((_, i) => i !== index));
  };

  const handlePreview = () => {
    // Save current survey to localStorage for preview with template and qualification
    localStorage.setItem('previewSurvey', JSON.stringify({
      title: surveyTitle,
      questions,
      template: template,
      requireQualification,
      qualificationQuestions,
      passScore
    }));
    // Navigate to preview page
    navigate('/survey/preview');
  };

  const handleDistribute = () => {
    if (questions.length === 0) {
      toast({
        title: "No questions",
        description: "Please add at least one question before distributing.",
        variant: "destructive"
      });
      return;
    }
    setShowDistributeDialog(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(surveyLink);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Survey link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <Input
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              className="text-2xl font-bold border-none p-0 h-auto focus-visible:ring-0 font-['Space_Grotesk']"
            />
            <p className="text-muted-foreground mt-1 text-sm">
              Edit your survey questions and settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // Save ALL survey data before navigating
                const qualificationData = {
                  requireQualification,
                  qualificationQuestions,
                  passScore
                };
                localStorage.setItem('qualificationData', JSON.stringify(qualificationData));
                
                // CRITICAL: Save current survey questions so they don't get lost
                const surveyData = {
                  title: surveyTitle,
                  template: template,
                  questions: questions
                };
                localStorage.setItem('currentSurvey', JSON.stringify(surveyData));
                
                navigate('/quality-control?surveyId=new');
              }}
            >
              <Shield className="w-4 h-4 mr-2" />
              Quality Control
            </Button>
            <Button onClick={handleSave} variant="outline" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
            <Button onClick={handleDistribute} className="bg-gradient-primary hover:opacity-90">
              <Share2 className="w-4 h-4 mr-2" />
              Distribute
            </Button>
          </div>
        </div>

        {/* Template Info */}
        <Card className="bg-accent/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Template</p>
                <p className="font-semibold">{template}</p>
              </div>
              {requireQualification && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Shield className="w-4 h-4" />
                  <span>Qualification Required</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className={`space-y-4 ${template === "Two Column" ? "md:grid md:grid-cols-2 md:gap-4 md:space-y-0" : template === "Card Grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0" : ""}`}>
          {questions.map((question, index) => (
            <Card key={question.id} className="hover:shadow-card transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <button className="mt-2 cursor-move text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                  </button>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground mb-2 block">Question {index + 1}</Label>
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                          className="resize-none text-base"
                          rows={2}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteQuestion(question.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground mb-2 block">Question Type</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) => updateQuestion(question.id, "type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            <SelectItem value="text">Short Text</SelectItem>
                            <SelectItem value="paragraph">Paragraph</SelectItem>
                            <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                            <SelectItem value="checkboxes">Checkboxes</SelectItem>
                            <SelectItem value="dropdown">Dropdown</SelectItem>
                            <SelectItem value="rating">Rating Scale</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id={`required-${question.id}`}
                          checked={question.required}
                          onChange={(e) => updateQuestion(question.id, "required", e.target.checked)}
                          className="rounded border-input"
                        />
                        <Label htmlFor={`required-${question.id}`} className="text-sm cursor-pointer">
                          Required
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addQuestion}
            className="w-full border-dashed border-2 h-16 hover:border-primary hover:bg-accent"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Question
          </Button>
        </div>

        {/* Survey Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Survey Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Response Limit</Label>
                <Input type="number" placeholder="Unlimited" />
              </div>
              <div className="space-y-2">
                <Label>Close Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="shuffle" className="rounded border-input" />
              <Label htmlFor="shuffle" className="cursor-pointer">
                Shuffle question order
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="anonymous" className="rounded border-input" defaultChecked />
              <Label htmlFor="anonymous" className="cursor-pointer">
                Allow anonymous responses
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>
      </ScrollArea>

      {/* Distribute Dialog */}
      <Dialog open={showDistributeDialog} onOpenChange={setShowDistributeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Distribute Survey</DialogTitle>
            <DialogDescription>
              Share this link with your respondents to collect responses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={surveyLink}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`mailto:?subject=${encodeURIComponent(surveyTitle)}&body=${encodeURIComponent(`Please fill out this survey: ${surveyLink}`)}`)}
              >
                Share via Email
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Take my survey: ${surveyTitle}`)}&url=${encodeURIComponent(surveyLink)}`)}
              >
                Share on Twitter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SurveyEditor;
