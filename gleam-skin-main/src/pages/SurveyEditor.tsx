import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, Shield, Save, Share2, GripVertical, Trash2, Palette, Type, Layout, ChevronUp, ChevronDown, Check, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Loader2, Sparkles, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Question {
  text: string;
  type: string;
  required: boolean;
  options?: string[];
  ratingType?: 'number' | 'star';
  imageUrl?: string;
}

export default function SurveyEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // Get ID from URL
  const { toast } = useToast();

  const { surveyData: initialSurveyData, template: initialTemplate, showPreview } = location.state || {};

  // Initialize state with props OR defaults, but allow updates from fetch
  const [questions, setQuestions] = useState<Question[]>(initialSurveyData?.questions || []);
  const [title, setTitle] = useState(initialSurveyData?.title || "Generated Survey");
  const [requireQualification, setRequireQualification] = useState(initialSurveyData?.require_qualification || false);
  const [template, setTemplate] = useState<string>(initialTemplate || "single-column");
  const [surveyId, setSurveyId] = useState<string | null>(initialSurveyData?.id || id || null);

  useEffect(() => {
    // If we have an ID but no initial data (e.g. direct URL access or refresh), fetch it
    if (surveyId && !initialSurveyData) {
      const fetchSurvey = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/surveys/${surveyId}/`);
          if (response.ok) {
            const data = await response.json();
            setTitle(data.title);
            setQuestions(data.questions || []);
            setTemplate(data.template || "single-column");
            setRequireQualification(data.require_qualification || false);
            if (data.design) {
              setDesign(data.design);
            }
          } else {
            toast({ title: "Error", description: "Survey not found", variant: "destructive" });
          }
        } catch (error) {
          console.error("Fetch error:", error);
          toast({ title: "Error", description: "Failed to load survey", variant: "destructive" });
        }
      };
      fetchSurvey();
    }
  }, [surveyId, initialSurveyData, toast]);

  // Design State
  const [design, setDesign] = useState({
    fontFamily: "font-sans",
    primaryColor: "#3b82f6", // Default blue
    backgroundColor: "#f8fafc", // Default slate-50
    formColor: "#ffffff", // New: Form Container Color
    borderRadius: "0.5rem",
    questionSpacing: 4,
    logoUrl: "" as string // Added logoUrl
  });

  const addSection = () => {
    setQuestions([
      ...questions,
      {
        text: "New Section",
        type: "section_header",
        required: false
      }
    ]);
    toast({ title: "Section Added", description: "New section break created." });
  };

  const [isPreviewMode, setIsPreviewMode] = useState(showPreview || false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [generatingOptionsFor, setGeneratingOptionsFor] = useState<number | null>(null); // Track specific question generating
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // For Page-by-Page template
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0); // For Sectional template
  const [isGeneratingImage, setIsGeneratingImage] = useState(false); // Track image generation

  const previewSections = useMemo(() => {
    const sections: Array<{ title: string, questions: any[] }> = [];
    let currentQ: any[] = [];
    let currentT = "Start";

    questions.forEach(q => {
      if (q.type === 'section_header') {
        if (currentQ.length > 0) sections.push({ title: currentT, questions: currentQ });
        currentQ = [];
        currentT = q.text || "Section";
      } else {
        currentQ.push(q);
      }
    });
    if (currentQ.length > 0) sections.push({ title: currentT, questions: currentQ });
    if (sections.length === 0) sections.push({ title: "Start", questions: [] });

    return sections;
  }, [questions]);

  const handleGenerateImage = async (type: 'logo' | 'question', index?: number) => {
    const prompt = type === 'logo' ? `Logo for ${title}, minimalistic, vector art, white background` :
      type === 'question' && index !== undefined ? `Illustration for: ${questions[index].text}, flat design, vector style, white background` : '';

    if (!prompt) return;

    setIsGeneratingImage(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai/generate-image/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      if (data.image) {
        if (type === 'logo') {
          setDesign(prev => ({ ...prev, logoUrl: data.image }));
          toast({ title: "Logo Generated", description: "New logo applied!" });
        } else if (type === 'question' && index !== undefined) {
          updateQuestion(index, 'imageUrl', data.image);
          toast({ title: "Image Generated", description: "Question illustration applied!" });
        }
      }
    } catch (error) {
      toast({ title: "Generation Failed", description: "Could not generate image", variant: "destructive" });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    if (!updated[qIndex].options) updated[qIndex].options = ["Option 1", "Option 2"];
    updated[qIndex].options![oIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    if (!updated[qIndex].options) updated[qIndex].options = ["Option 1"];
    else updated[qIndex].options!.push(`Option ${updated[qIndex].options!.length + 1}`);
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options && updated[qIndex].options!.length > 1) {
      updated[qIndex].options = updated[qIndex].options!.filter((_, i) => i !== oIndex);
      setQuestions(updated);
    }
  };

  const handleGenerateOptions = async (index: number) => {
    const questionText = questions[index].text;
    if (!questionText) {
      toast({ title: "Question required", description: "Please enter a question first", variant: "destructive" });
      return;
    }

    setGeneratingOptionsFor(index);
    try {
      const response = await fetch('http://localhost:8000/api/ai/generate-options/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText })
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      if (data.options && Array.isArray(data.options)) {
        const updated = [...questions];
        updated[index].options = data.options;
        setQuestions(updated);
        toast({ title: "Options Generated", description: "AI suggested optimal choices!" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate options", variant: "destructive" });
    } finally {
      setGeneratingOptionsFor(null);
    }
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
      const payload = {
        title,
        questions,
        template,
        require_qualification: requireQualification,
        design: design
      };

      let response;
      if (surveyId) {
        // Update existing survey
        response = await fetch(`http://localhost:8000/api/surveys/${surveyId}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new survey
        response = await fetch('http://localhost:8000/api/surveys/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save');
      }

      toast({
        title: "Survey Saved",
        description: "Your survey has been saved successfully"
      });
      navigate("/surveys");
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save survey",
        variant: "destructive"
      });
    }
  };

  const getTemplateName = () => {
    const templates: Record<string, string> = {
      "single-column": "Standard Scroll",
      "page-by-page": "Page-by-Page",
      "minimalist": "Minimalist Focus"
    };
    return templates[template] || "Standard Scroll";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/my-surveys')} className="mr-2">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    {title || "Untitled Survey"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isPreviewMode ? "Visual Editor Mode" : "Structure Editor"}
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200 mx-2" />
              <div className="flex bg-muted p-1 rounded-lg">
                <Button
                  variant={!isPreviewMode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsPreviewMode(false)}
                  className="text-xs"
                >
                  Structure
                </Button>
                <Button
                  variant={isPreviewMode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsPreviewMode(true)}
                  className="text-xs"
                >
                  Visual / Design
                </Button>
              </div>

              <div className="h-8 w-px bg-gray-200 mx-2" />

              {/* Template Switcher */}
              <div className="w-48">
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="h-8 text-xs border-dashed bg-transparent border-gray-300">
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-column">Standard Scroll</SelectItem>
                    <SelectItem value="page-by-page">Page-by-Page</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="sectional">Section by Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden border-none shadow-2xl" style={{ borderRadius: '1rem' }}>
                  <div className="h-full w-full overflow-y-auto flex flex-col" style={{ backgroundColor: design.backgroundColor }}>

                    {/* Premium Header/Banner */}
                    <div className="w-full h-32 shrink-0 bg-white/30 backdrop-blur-md flex items-end justify-center pb-6 border-b border-white/20 sticky top-0 z-10">
                      <h2 className="text-lg font-medium text-gray-600/80 uppercase tracking-widest pl-4 pr-4 py-1 rounded-full bg-white/40">Survey Preview</h2>
                    </div>

                    <div className="flex-1 py-12 px-4">
                      <div className={`mx-auto p-10 transition-all duration-500 ease-in-out ${template === 'minimalist' ? 'max-w-3xl' : // Minimalist: narrower, no shadow/border classes added here (handled below)
                        'max-w-2xl space-y-8 shadow-2xl' // Standard/Default: Shadow & Spacing
                        }`}
                        style={{
                          fontFamily: design.fontFamily,
                          borderRadius: template === 'minimalist' ? '0' : design.borderRadius,
                          backgroundColor: template === 'minimalist' ? 'transparent' : design.formColor
                        }}>

                        <div className={`text-center space-y-3 mb-12`}>
                          {design.logoUrl && (
                            <img src={design.logoUrl} alt="Logo" className="w-24 h-24 mx-auto object-contain mb-4 rounded-xl shadow-sm" />
                          )}
                          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: design.primaryColor }}>{title}</h1>
                          {template !== 'minimalist' && (
                            <div className="h-1 w-20 mx-auto rounded-full opacity-30" style={{ backgroundColor: design.primaryColor }} />
                          )}
                          <p className="text-muted-foreground text-lg">Please answer the following questions accurately.</p>
                        </div>

                        {/* RENDER QUESTIONS BASED ON TEMPLATE */}
                        {template === 'page-by-page' ? (
                          // PAGE-BY-PAGE VIEW
                          <div className="min-h-[400px] flex flex-col justify-between">
                            {questions[currentQuestionIndex] && (
                              <div key={currentQuestionIndex} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                                <div className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-2">Question {currentQuestionIndex + 1} of {questions.length}</div>
                                {questions[currentQuestionIndex].imageUrl && (
                                  <img src={questions[currentQuestionIndex].imageUrl} alt="Question Illustration" className="w-full h-48 object-cover rounded-xl mb-4 shadow-sm" />
                                )}
                                <Label className="text-3xl font-medium block text-gray-800 leading-tight">
                                  {questions[currentQuestionIndex].text}
                                  {questions[currentQuestionIndex].required && <span className="text-red-500 ml-1">*</span>}
                                </Label>

                                <div className="pt-4">
                                  {questions[currentQuestionIndex].type === 'text' && (
                                    <Input className="bg-transparent border-0 border-b-2 border-gray-300 focus-visible:ring-0 px-0 py-4 text-2xl focus-visible:border-gray-800 rounded-none transition-colors placeholder:text-gray-300" placeholder="Type your answer..." />
                                  )}

                                  {(questions[currentQuestionIndex].type === 'multiple_choice' || questions[currentQuestionIndex].type === 'checkboxes') && (
                                    <div className="space-y-3 mt-6">
                                      {(questions[currentQuestionIndex].options || ['Option 1', 'Option 2']).map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-gray-200 hover:bg-white/60 cursor-pointer transition-all group">
                                          {questions[currentQuestionIndex].type === 'multiple_choice' ? (
                                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors" />
                                          ) : (
                                            <div className="w-6 h-6 rounded border-2 border-gray-300 group-hover:border-blue-500 transition-colors" />
                                          )}
                                          <span className="text-xl text-gray-600 group-hover:text-gray-900">{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {questions[currentQuestionIndex].type === 'rating' && (
                                    <div className="flex gap-4 mt-6">
                                      {questions[currentQuestionIndex].ratingType === 'star' ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                          <button key={i} className="group/star text-gray-300 hover:text-yellow-400 transition-colors">
                                            <Star className="w-12 h-12 fill-current" />
                                          </button>
                                        ))
                                      ) : (
                                        [1, 2, 3, 4, 5].map(i => (
                                          <div key={i} className="w-16 h-16 rounded-full border-2 text-2xl font-medium flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer">{i}</div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                              <Button
                                variant="ghost"
                                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                Previous
                              </Button>

                              {currentQuestionIndex < questions.length - 1 ? (
                                <Button
                                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                                  className="px-8 bg-gray-900 text-white hover:bg-gray-800"
                                >
                                  Next
                                </Button>
                              ) : (
                                <Button
                                  style={{ backgroundColor: design.primaryColor }}
                                  className="px-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                  Submit
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : template === 'sectional' ? (
                          // SECTIONAL VIEW
                          <div className="min-h-[400px] flex flex-col justify-between">
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500" key={currentSectionIndex}>
                              <div className="pb-4 border-b border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-800">{previewSections[currentSectionIndex]?.title}</h2>
                                <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Section {currentSectionIndex + 1} of {previewSections.length}</div>
                              </div>

                              {previewSections[currentSectionIndex]?.questions.map((q, i) => (
                                <div key={i} className="space-y-3">
                                  <Label className="text-lg font-medium text-gray-800 block">
                                    {q.text}
                                    {q.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>
                                  {/* Simplified inputs for preview */}
                                  {q.type === 'text' && <Input className="bg-gray-50/50" placeholder="Your answer..." />}
                                  {(q.type === 'multiple_choice' || q.type === 'checkboxes') && (
                                    <div className="space-y-2">
                                      {(q.options || ['Option 1', 'Option 2']).map((opt: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 text-gray-600">
                                          <div className="w-4 h-4 border rounded-full border-gray-300" />
                                          <span>{opt}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                              <Button
                                variant="ghost"
                                onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                                disabled={currentSectionIndex === 0}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                Previous Section
                              </Button>

                              {currentSectionIndex < previewSections.length - 1 ? (
                                <Button
                                  onClick={() => setCurrentSectionIndex(Math.min(previewSections.length - 1, currentSectionIndex + 1))}
                                  className="px-6 bg-gray-900 text-white hover:bg-gray-800"
                                >
                                  Next Section
                                </Button>
                              ) : (
                                <Button
                                  style={{ backgroundColor: design.primaryColor }}
                                  className="px-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                  Submit
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          // STANDARD / MINIMALIST LIST VIEW
                          <>
                            {questions.map((q, i) => {
                              if (q.type === 'section_header') {
                                return (
                                  <div key={i} className={`pt-8 pb-4 border-b border-gray-200 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700`} style={{ animationDelay: `${i * 100}ms` }}>
                                    <h2 className="text-2xl font-bold" style={{ color: design.primaryColor }}>
                                      {q.text}
                                    </h2>
                                  </div>
                                );
                              }

                              return (
                                <div key={i} className={`space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ${template === 'minimalist' ? 'border-b border-gray-100 pb-12 last:border-0' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
                                  <Label className={`font-medium block text-gray-800 ${template === 'minimalist' ? 'text-2xl mb-4' : 'text-xl'}`}>
                                    <span className="text-gray-400 mr-2">{i + 1}.</span>
                                    {q.text}
                                    {q.required && <span className="text-red-500 ml-1">*</span>}
                                  </Label>

                                  <div className="pl-6">
                                    {q.type === 'text' && (
                                      <Input className={`bg-transparent border-0 border-b-2 border-gray-200 focus-visible:ring-0 px-0 py-2 focus-visible:border-gray-800 rounded-none transition-colors ${template === 'minimalist' ? 'text-xl' : 'text-lg'}`} placeholder="Type your answer here..." />
                                    )}

                                    {(q.type === 'multiple_choice' || q.type === 'checkboxes') && (
                                      <div className="space-y-3">
                                        {(q.options || ['Option 1', 'Option 2']).map((opt, idx) => (
                                          <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${template === 'minimalist' ? 'hover:bg-gray-50' : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'}`}>
                                            {q.type === 'multiple_choice' ? (
                                              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                            ) : (
                                              <div className="w-5 h-5 rounded border-2 border-gray-300" />
                                            )}
                                            <span className={`text-gray-700 ${template === 'minimalist' ? 'text-lg' : 'text-lg'}`}>{opt}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {q.type === 'rating' && (
                                      <div className="flex gap-2">
                                        {q.ratingType === 'star' ? (
                                          [1, 2, 3, 4, 5].map(i => (
                                            <button key={i} className="group/star">
                                              <Star className="w-8 h-8 text-gray-300 hover:text-yellow-400 fill-transparent hover:fill-yellow-400 transition-all" />
                                            </button>
                                          ))
                                        ) : (
                                          [1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer">{i}</div>
                                          ))
                                        )}
                                      </div>
                                    )}

                                    {q.type === 'yes_no' && (
                                      <div className="flex gap-4">
                                        <Button variant="outline" className="w-24">Yes</Button>
                                        <Button variant="outline" className="w-24">No</Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            <div className="pt-10">
                              <Button
                                className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 font-semibold tracking-wide"
                                style={{ backgroundColor: design.primaryColor }}
                              >
                                Submit Survey Response
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="text-center mt-12 text-sm text-gray-400 font-medium">
                        Powered by Gleam Surveys
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">

        {/* Editor Area */}
        <div className="flex-1" style={{
          backgroundColor: isPreviewMode ? design.backgroundColor : 'transparent',
          minHeight: '80vh',
          transition: 'background-color 0.3s ease',
          fontFamily: isPreviewMode ? design.fontFamily : 'inherit'
        }}>
          {!isPreviewMode ? (
            // STANDARD STRUCTURE EDITOR
            <div className="space-y-4">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <Label>Survey Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 text-lg font-semibold"
                  />
                  <div className="flex items-center gap-3 mt-4">
                    <Checkbox
                      checked={requireQualification}
                      onCheckedChange={(checked) => setRequireQualification(checked as boolean)}
                    />
                    <Label>Require Qualification Test</Label>
                  </div>
                </CardContent>
              </Card>

              {questions.map((q, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-2 flex flex-col gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveQuestion(index, 'up')} disabled={index === 0}>
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1}>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Label className={`text-xs ${q.type === 'section_header' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                              {q.type === 'section_header' ? `Section ${index + 1} Title` : `Question ${index + 1}`}
                            </Label>
                            <Input
                              value={q.text || ""}
                              onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                              className={`mt-2 font-medium ${q.type === 'section_header' ? 'text-xl border-primary/50 bg-primary/5' : ''}`}
                              placeholder={q.type === 'section_header' ? "Enter section title (e.g. 'Demographics')..." : "Enter question text..."}
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
                        {/* Type Selection & Required Checkbox (Same as before) */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs">Question Type</Label>
                              <Select value={q.type} onValueChange={(value) => updateQuestion(index, 'type', value)}>
                                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text Answer</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                  <SelectItem value="rating">Rating Scale</SelectItem>
                                  <SelectItem value="yes_no">Yes / No</SelectItem>
                                  <SelectItem value="checkboxes">Checkboxes</SelectItem>
                                  <SelectItem value="section_header" className="font-semibold text-primary">Section Break / Header</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Rating Type Toggle */}
                            {q.type === 'rating' && (
                              <div>
                                <Label className="text-xs">Rating Style</Label>
                                <div className="flex bg-gray-100 p-1 rounded-md mt-1">
                                  <button
                                    onClick={() => updateQuestion(index, 'ratingType', 'number')}
                                    className={`flex-1 text-xs py-1 px-2 rounded-sm transition-all ${(!q.ratingType || q.ratingType === 'number') ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:bg-gray-200'}`}
                                  >
                                    Numbers (1-5)
                                  </button>
                                  <button
                                    onClick={() => updateQuestion(index, 'ratingType', 'star')}
                                    className={`flex-1 text-xs py-1 px-2 rounded-sm transition-all ${q.ratingType === 'star' ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:bg-gray-200'}`}
                                  >
                                    Stars (⭐)
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-end mb-2">
                            {q.type !== 'section_header' && (
                              <div className="flex items-center gap-2">
                                <Checkbox checked={q.required} onCheckedChange={(checked) => updateQuestion(index, 'required', checked as boolean)} />
                                <Label className="text-sm">Required</Label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // VISUAL / PREVIEW MODE (Word-like Edit)
            <div className="space-y-8 max-w-3xl mx-auto p-8 rounded-xl min-h-[600px] shadow-xl backdrop-blur-sm transition-colors duration-300"
              style={{
                borderRadius: design.borderRadius,
                backgroundColor: design.formColor
              }}>

              {/* Title Area */}
              <div className="text-center space-y-2 group">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-center text-4xl font-bold bg-transparent border-none focus:ring-0 placeholder:text-gray-300 hover:bg-gray-50/50 rounded p-2 transition-colors"
                  style={{ color: design.primaryColor }}
                  placeholder="Survey Title"
                />
                <p className="text-muted-foreground">Click text to edit • Drag to reorder (structure view)</p>
              </div>

              {requireQualification && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-center gap-2 text-orange-700">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Qualification Test Required</span>
                </div>
              )}

              <div className="space-y-6" style={{ gap: `${design.questionSpacing}rem` }}>
                {questions.map((q, index) => (
                  <div key={index} className="group relative p-6 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white/50 transition-all">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveQuestion(index, 'up')} disabled={index === 0}><ChevronUp className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => moveQuestion(index, 'down')} disabled={index === questions.length - 1}><ChevronDown className="w-4 h-4" /></Button>
                    </div>

                    <div className="space-y-3">
                      <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Question {index + 1}</span>
                      {/* Image Generation for Page-by-Page */}
                      {template === 'page-by-page' && (
                        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1 bg-white/80 backdrop-blur-sm"
                            onClick={() => handleGenerateImage('question', index)}
                            disabled={isGeneratingImage}
                          >
                            {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-500" />}
                            Generate Scene
                          </Button>
                        </div>
                      )}

                      {q.imageUrl && template === 'page-by-page' && (
                        <div className="mb-4 relative group/image">
                          <img src={q.imageUrl} alt="Scene" className="w-full h-32 object-cover rounded-lg border border-gray-100" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/image:opacity-100 transition-opacity"
                            onClick={() => updateQuestion(index, 'imageUrl', undefined)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}

                      <input
                        value={q.text}
                        onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                        className="w-full text-xl font-medium bg-transparent border-none focus:ring-0 p-0 hover:text-blue-600 transition-colors"
                        placeholder="Type question here..."
                      />

                      {/* Mock Input based on type */}
                      <div className="pt-2">
                        {q.type === 'text' && <div className="h-10 border-b border-gray-300 bg-gray-50/50" />}

                        {(q.type === 'multiple_choice' || q.type === 'checkboxes') && (
                          <div className="space-y-2">
                            {(q.options || ['Option 1', 'Option 2']).map((opt, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-3 group/option">
                                {q.type === 'multiple_choice' ? (
                                  <div className="w-4 h-4 rounded-full border border-gray-400" />
                                ) : (
                                  <div className="w-4 h-4 rounded border border-gray-400" />
                                )}
                                <input
                                  value={opt}
                                  onChange={(e) => handleOptionChange(index, oIndex, e.target.value)}
                                  className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-gray-700 placeholder:text-gray-400"
                                  placeholder={`Option ${oIndex + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover/option:opacity-100 text-red-400 hover:text-red-600"
                                  onClick={() => removeOption(index, oIndex)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-600 hover:text-blue-700 pl-0 mt-1"
                                onClick={() => addOption(index)}
                              >
                                + Add Option
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs text-purple-600 border-purple-200 hover:bg-purple-50 h-7"
                                onClick={() => handleGenerateOptions(index)}
                                disabled={generatingOptionsFor === index}
                              >
                                {generatingOptionsFor === index ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                {generatingOptionsFor === index ? 'Generating...' : 'AI Generate'}
                              </Button>
                            </div>
                          </div>
                        )}

                        {q.type === 'rating' && (
                          <div className="flex gap-2">
                            {q.ratingType === 'star' ? (
                              // Star View
                              [1, 2, 3, 4, 5].map(i => (
                                <button key={i} className="group/star">
                                  <Star className="w-8 h-8 text-gray-300 hover:text-yellow-400 fill-transparent hover:fill-yellow-400 transition-all" />
                                </button>
                              ))
                            ) : (
                              // Number View
                              [1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer">{i}</div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DESIGN PANEL (Only in Preview Mode) */}
        {isPreviewMode && (
          <div className="w-80 shrink-0">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Design & Style</h3>
                </div>

                {/* AI Logo Generator */}
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <Label className="text-indigo-900 font-medium">AI Brand Logo</Label>
                  </div>
                  <p className="text-xs text-indigo-600/80 leading-relaxed">Generate a unique logo for your survey based on the title.</p>
                  <Button
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    onClick={() => handleGenerateImage('logo')}
                    disabled={isGeneratingImage}
                  >
                    {isGeneratingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {isGeneratingImage ? 'Creating...' : 'Generate New Logo'}
                  </Button>
                  {design.logoUrl && (
                    <div className="relative group mt-2">
                      <img src={design.logoUrl} className="w-full h-24 object-contain bg-white rounded-md border border-indigo-100 p-2" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 bg-white/80 hover:bg-white text-red-500"
                        onClick={() => setDesign({ ...design, logoUrl: '' })}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Brand Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={design.primaryColor}
                        onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                        className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-gray-500">{design.primaryColor}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Card/Form Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={design.formColor}
                        onChange={(e) => setDesign({ ...design, formColor: e.target.value })}
                        className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-gray-500">{design.formColor}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={design.backgroundColor.startsWith('linear') ? '#ffffff' : design.backgroundColor}
                        onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                        className="w-12 h-12 p-1 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-gray-500">{design.backgroundColor.startsWith('linear') ? 'Gradient' : design.backgroundColor}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      <Label>Typography</Label>
                    </div>
                    <Select value={design.fontFamily} onValueChange={(val) => setDesign({ ...design, fontFamily: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="font-sans">Modern Sans</SelectItem>
                        <SelectItem value="font-serif">Elegant Serif</SelectItem>
                        <SelectItem value="font-mono">Technical Mono</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      <Label>Rounded Corners</Label>
                    </div>
                    <Slider
                      value={[parseInt(design.borderRadius === '0rem' ? '0' : design.borderRadius === '0.5rem' ? '8' : '16')]}
                      max={20}
                      step={4}
                      onValueChange={(val) => setDesign({ ...design, borderRadius: `${val[0] / 16}rem` })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
