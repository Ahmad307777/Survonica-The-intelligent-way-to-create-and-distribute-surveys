import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, Shield, Save, Share2, GripVertical, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  text: string;
  type: string;
  required: boolean;
  options?: string[];
}

export default function SurveyEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { surveyData, template } = location.state || {};
  const [questions, setQuestions] = useState<Question[]>(surveyData?.questions || []);
  const [title, setTitle] = useState(surveyData?.title || "Generated Survey");
  const [requireQualification, setRequireQualification] = useState(false);

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQualityControl = () => {
    if (requireQualification) {
      navigate("/create-qualification-test", {
        state: {
          surveyData: {
            title,
            questions,
            template,
            require_qualification: true
          }
        }
      });
    } else {
      toast({
        title: "Enable Qualification Test",
        description: "Please enable 'Qualification Required' first",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    try {
      // Save survey logic here
      toast({
        title: "Survey Saved",
        description: "Your survey has been saved successfully"
      });
      navigate("/my-surveys");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save survey",
        variant: "destructive"
      });
    }
  };

  const getTemplateName = () => {
    const templates: Record<string, string> = {
      "single-column": "Single Column",
      "two-column": "Two Column",
      "card-grid": "Card Grid"
    };
    return templates[template] || "Single Column";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Generated Survey</h1>
              <p className="text-sm text-muted-foreground">
                Edit your survey questions and settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQualityControl}
              >
                <Shield className="w-4 h-4 mr-2" />
                Quality Control
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" className="bg-gradient-primary">
                <Share2 className="w-4 h-4 mr-2" />
                Distribute
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Template Info */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Current Template</p>
              <p className="text-lg font-bold text-blue-700">{getTemplateName()}</p>
            </div>
            {requireQualification && (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-lg">
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700">
                  Qualification Required
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Survey Title */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Label>Survey Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 text-lg font-semibold"
            />
          </CardContent>
        </Card>

        {/* Qualification Toggle */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={requireQualification}
                  onCheckedChange={(checked) => setRequireQualification(checked as boolean)}
                />
                <div>
                  <Label className="text-base font-semibold">Require Qualification Test</Label>
                  <p className="text-sm text-muted-foreground">
                    Pre-screen respondents with a qualification test
                  </p>
                </div>
              </div>
              {requireQualification && (
                <Button
                  variant="outline"
                  onClick={handleQualityControl}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Configure Test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-2 cursor-move">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">
                          Question {index + 1}
                        </Label>
                        <Input
                          value={q.text}
                          onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                          className="mt-2 font-medium"
                          placeholder="Enter question text..."
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Question Type</Label>
                        <Select
                          value={q.type}
                          onValueChange={(value) => updateQuestion(index, 'type', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="rating">Rating Scale</SelectItem>
                            <SelectItem value="yes_no">Yes/No</SelectItem>
                            <SelectItem value="checkboxes">Checkboxes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={q.required}
                            onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                          />
                          <Label className="text-sm">Required</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
