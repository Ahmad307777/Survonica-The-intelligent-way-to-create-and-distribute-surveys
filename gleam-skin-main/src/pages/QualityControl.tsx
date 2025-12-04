import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, ArrowLeft, Save } from "lucide-react";

interface QualificationQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const QualityControl = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get("surveyId");

  const [requireQualification, setRequireQualification] = useState(false);
  const [qualificationQuestions, setQualificationQuestions] = useState<QualificationQuestion[]>([]);
  const [passScore, setPassScore] = useState(80);

  // Load qualification data from localStorage if exists
  useEffect(() => {
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

  const handleSave = () => {
    if (requireQualification && qualificationQuestions.length === 0) {
      toast({
        title: "Add qualification questions",
        description: "Please add at least one question before saving",
        variant: "destructive"
      });
      return;
    }

    // Check if all qualification questions are complete
    if (requireQualification) {
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

    // Save to localStorage - this will sync with editor
    localStorage.setItem('qualificationData', JSON.stringify({
      requireQualification,
      qualificationQuestions,
      passScore
    }));

    toast({
      title: "Settings saved",
      description: requireQualification 
        ? `Quality control enabled with ${qualificationQuestions.length} question(s)` 
        : "Quality control disabled"
    });

    // Navigate back to editor
    navigate(`/editor/${surveyId || 'new'}`);
  };

  const handleBack = () => {
    navigate(`/editor/${surveyId || 'new'}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Quality Control</h1>
          </div>
          <p className="text-muted-foreground">
            Enable quality control by requiring respondents to pass a knowledge test
          </p>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Switch */}
          <Card>
            <CardHeader>
              <CardTitle>Qualification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Require Qualification Test</Label>
                  <p className="text-sm text-muted-foreground">
                    Only qualified respondents can access your survey
                  </p>
                </div>
                <Switch 
                  checked={requireQualification} 
                  onCheckedChange={setRequireQualification}
                />
              </div>

              {requireQualification && (
                <div className="pt-4 border-t space-y-4">
                  <div>
                    <Label>Passing Score: {passScore}%</Label>
                    <Slider
                      value={[passScore]}
                      onValueChange={(value) => setPassScore(value[0])}
                      min={50}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Respondents must score at least {passScore}% to qualify
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Qualification Questions */}
          {requireQualification && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Qualification Questions</CardTitle>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={addQualificationQuestion}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {qualificationQuestions.length === 0 ? (
                  <div className="bg-muted p-8 rounded-lg text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      No qualification questions yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add questions to test respondent capability before they fill the survey
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {qualificationQuestions.map((q, qIndex) => (
                        <Card key={qIndex} className="p-6 border-2 border-border hover:border-primary/50 transition-colors bg-card">
                          <div className="space-y-5">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 space-y-2">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                                    {qIndex + 1}
                                  </span>
                                  Question
                                </Label>
                                <Input
                                  value={q.question}
                                  onChange={(e) => updateQualificationQuestion(qIndex, "question", e.target.value)}
                                  placeholder="Enter your question"
                                  className="text-base border-2 focus-visible:border-primary"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeQualificationQuestion(qIndex)}
                                className="text-destructive hover:bg-destructive/10 mt-7"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                              <Label className="text-sm font-semibold flex items-center gap-2">
                                <span className="text-primary">✓</span>
                                Answer Options (Select the correct one)
                              </Label>
                              {q.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-3 bg-background p-3 rounded-md border-2 border-border hover:border-primary/30 transition-colors">
                                  <input
                                    type="radio"
                                    id={`correct-${qIndex}-${oIndex}`}
                                    name={`correct-${qIndex}`}
                                    checked={q.correctAnswer === oIndex}
                                    onChange={() => updateQualificationQuestion(qIndex, "correctAnswer", oIndex)}
                                    className="flex-shrink-0 w-5 h-5 cursor-pointer accent-primary"
                                  />
                                  <Input
                                    value={option}
                                    onChange={(e) => updateQualificationOption(qIndex, oIndex, e.target.value)}
                                    placeholder={`Option ${oIndex + 1}`}
                                    className="flex-1 border-none focus-visible:ring-1"
                                  />
                                  <Label 
                                    htmlFor={`correct-${qIndex}-${oIndex}`}
                                    className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap"
                                  >
                                    {q.correctAnswer === oIndex ? "✓ Correct" : ""}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}

          {/* How it Works */}
          {requireQualification && (
            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="text-lg">How it works</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Create questions to test respondent knowledge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Respondents must pass before accessing your survey</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Results are tracked for quality control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>You can view qualification scores in the results</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handleBack}
              size="lg"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Apply Settings
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QualityControl;
