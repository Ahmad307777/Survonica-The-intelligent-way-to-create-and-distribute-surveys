import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, CheckCircle2, Shield, Star } from "lucide-react";

const SurveyResponse = () => {
  const { toast } = useToast();
  // Helper to convert Hex to HSL
  // Helper to convert Hex to HSL
  const hexToHSL = (hex: string) => {
    try {
      let r = 0, g = 0, b = 0;
      if (!hex) return "0 0% 0%"; // Default fallback

      const cleanHex = hex.replace('#', '');

      if (cleanHex.length === 3) {
        r = parseInt("0x" + cleanHex[0] + cleanHex[0]);
        g = parseInt("0x" + cleanHex[1] + cleanHex[1]);
        b = parseInt("0x" + cleanHex[2] + cleanHex[2]);
      } else if (cleanHex.length === 6) {
        r = parseInt("0x" + cleanHex[0] + cleanHex[1]);
        g = parseInt("0x" + cleanHex[2] + cleanHex[3]);
        b = parseInt("0x" + cleanHex[4] + cleanHex[5]);
      } else {
        return "220 25% 98%"; // Fallback
      }

      r /= 255;
      g /= 255;
      b /= 255;
      const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;
      let h = 0,
        s = 0,
        l = 0;

      if (delta === 0) h = 0;
      else if (cmax === r) h = ((g - b) / delta) % 6;
      else if (cmax === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;

      h = Math.round(h * 60);
      if (h < 0) h += 360;

      l = (cmax + cmin) / 2;
      s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
      s = +(s * 100).toFixed(1);
      l = +(l * 100).toFixed(1);

      return `${h} ${s}% ${l}%`;
    } catch (e) {
      console.error("Color conversion error", e);
      return "0 0% 0%";
    }
  };
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Load survey data from localStorage (for preview)
  const [survey, setSurvey] = useState<any>(null); // Changed to any to handle dynamic fields easily
  const [template, setTemplate] = useState<string>("Single Column");

  // Access Control State
  const [isRestricted, setIsRestricted] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [respondentEmail, setRespondentEmail] = useState("");
  const [emailValidated, setEmailValidated] = useState(false);

  // Qualification state
  const [requireQualification, setRequireQualification] = useState(false);
  const [qualificationQuestions, setQualificationQuestions] = useState<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>>([]);
  const [passScore, setPassScore] = useState(80);
  const [showingQualification, setShowingQualification] = useState(false);
  const [qualificationAnswers, setQualificationAnswers] = useState<Record<number, number>>({});
  const [qualificationPassed, setQualificationPassed] = useState(false);

  const [loading, setLoading] = useState(true);

  // Page-by-page navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const fetchSurvey = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/surveys/${id}/`);
          if (response.ok) {
            const data = await response.json();

            // Ensure every question has an ID to prevent state collision
            if (data.questions) {
              data.questions = data.questions.map((q: any, idx: number) => ({
                ...q,
                id: q.id || `q-${idx}-${Date.now()}`
              }));
            }

            setSurvey(data);
            setTemplate(data.template || "Single Column");

            // Check Access Control
            if (data.allowed_domains && data.allowed_domains.length > 0) {
              setIsRestricted(true);
              setAllowedDomains(data.allowed_domains);
            } else {
              // Public survey - auto validate or skip email check
              setEmailValidated(true);
            }

            if (data.require_qualification) {
              setRequireQualification(true);
              setPassScore(data.qualification_pass_score || 80);

              // Only start qualification if email is validated (or public)
              if (data.allowed_domains && data.allowed_domains.length === 0) {
                setShowingQualification(true);
              }

              // Fetch Qualification Test
              const testResponse = await fetch(`http://localhost:8000/api/qualification-tests/?survey=${id}`);
              if (testResponse.ok) {
                const testData = await testResponse.json();
                if (testData.length > 0) {
                  setQualificationQuestions(testData[0].questions);
                }
              }
            }
          } else {
            toast({
              title: "Error",
              description: "Survey not found",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Failed to load survey", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSurvey();
    } else {
      // Preview Mode Logic
      const savedSurvey = localStorage.getItem('previewSurvey');
      if (savedSurvey) {
        setSurvey(JSON.parse(savedSurvey));
        setEmailValidated(true); // Always validate for preview
      }
      setLoading(false);
    }
  }, [id, toast]);



  // Apply Design Settings
  useEffect(() => {
    if (survey && survey.design) {
      const root = document.documentElement;

      // 1. Primary Color
      if (survey.design.primaryColor) {
        const hsl = hexToHSL(survey.design.primaryColor);
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
      }

      // 2. Background Color
      if (survey.design.backgroundColor) {
        // If it's a gradient or hex, we need to handle it.
        // For simplicity, we assume hex for background color in this implementation, 
        // or apply it directly to body if it's not utilizing CSS var for "bg-background" class
        if (survey.design.backgroundColor.startsWith('#')) {
          root.style.setProperty('--background', hexToHSL(survey.design.backgroundColor));
        } else {
          // It might be a gradient string or transparent?
          // If it is a gradient, we can't put it in a HSL variable easily.
          // We set a custom variable or style body directly.
          document.body.style.background = survey.design.backgroundColor;
        }
      }

      // 3. Fonts
      if (survey.design.fontFamily) {
        const fontMap: Record<string, string> = {
          'font-sans': 'Inter, sans-serif',
          'font-serif': 'Merriweather, serif',
          'font-mono': 'JetBrains Mono, monospace'
        };
        document.body.style.fontFamily = fontMap[survey.design.fontFamily] || 'Inter, sans-serif';
      }

      // 4. Border Radius (if stored)
      if (survey.design.borderRadius) {
        root.style.setProperty('--radius', survey.design.borderRadius);
      }
    }
  }, [survey]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondentEmail) return;

    // Validate Domain
    const domain = "@" + respondentEmail.split('@')[1];
    const isAllowed = allowedDomains.some(d => domain.endsWith(d) || d === '*');

    if (isAllowed) {
      setEmailValidated(true);
      if (requireQualification) {
        setShowingQualification(true);
      }
      toast({
        title: "Access Granted",
        description: "You may proceed to the survey.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: `This survey is restricted to users from: ${allowedDomains.join(', ')}`,
        variant: "destructive",
      });
    }
  };

  const handleQualificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(qualificationAnswers).length < qualificationQuestions.length) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions",
        variant: "destructive",
      });
      return;
    }

    let correctAnswers = 0;
    qualificationQuestions.forEach((q, index) => {
      // Logic for comparing answers - assuming simple index match for now
      // In a real app, 'correctAnswer' field matches the index of options
      if (qualificationAnswers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const scorePercentage = Math.round((correctAnswers / qualificationQuestions.length) * 100);

    if (scorePercentage >= passScore) {
      setQualificationPassed(true);
      setShowingQualification(false);
      toast({
        title: "Passed!",
        description: `Score: ${scorePercentage}%. Proceeding to survey.`,
      });
    } else {
      toast({
        title: "Failed",
        description: `Score: ${scorePercentage}%. Required: ${passScore}%`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // (Existing validation logic...)

    try {
      if (id) {
        const response = await fetch('http://localhost:8000/api/survey-responses/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            survey_id: id,
            respondent_email: respondentEmail || "anonymous@example.com",
            responses: responses
          }),
        });
        // ... (Existing success logic)
        if (response.ok) {
          setSubmitted(true);
        }
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      // ...
    }
  };

  // 0. Loading State & Error Handling
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center shadow-elegant">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Survey Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The survey you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  // 1. Email Gate for Restricted Surveys
  if (isRestricted && !emailValidated) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-elegant border-0 animate-fade-in">
          <div className="h-2 bg-gradient-primary" />
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Restricted Access</CardTitle>
            <CardDescription>
              This survey is restricted to specific users. Please enter your email to verify access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  required
                />
              </div>
              {allowedDomains.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Allowed domains: {allowedDomains.join(', ')}
                </p>
              )}
              <Button className="w-full bg-gradient-primary">
                Verify & Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show qualification test if required and not passed
  if (showingQualification && !qualificationPassed) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-elegant border-0 overflow-hidden animate-fade-in">
            <div className="h-2 bg-gradient-success" />
            <CardHeader className="p-8 bg-gradient-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-success flex items-center justify-center shadow-glow">
                  <Shield className="w-7 h-7 text-success-foreground" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-success uppercase tracking-wider">Qualification Test</span>
                  <p className="text-sm text-muted-foreground">Pass score: {passScore}%</p>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold mb-2">Pre-Qualification Test</CardTitle>
              <CardDescription className="text-base">
                Complete this test to qualify for: <strong className="text-foreground">{survey.title}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleQualificationSubmit} className="space-y-10">
                {qualificationQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-success text-success-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                        {qIndex + 1}
                      </span>
                      <span className="flex-1 pt-0.5">
                        {q.question}
                        <span className="text-destructive ml-2">*</span>
                      </span>
                    </h3>
                    <RadioGroup
                      value={qualificationAnswers[qIndex]?.toString()}
                      onValueChange={(value) =>
                        setQualificationAnswers({ ...qualificationAnswers, [qIndex]: parseInt(value) })
                      }
                      className="space-y-3 ml-11"
                    >
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex} className="relative">
                          <RadioGroupItem
                            value={oIndex.toString()}
                            id={`q${qIndex}-o${oIndex}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`q${qIndex}-o${oIndex}`}
                            className="flex items-center gap-4 w-full px-6 py-5 bg-card border-2 border-border rounded-2xl cursor-pointer transition-all duration-300 hover:border-success hover:shadow-option-hover hover:scale-[1.02] peer-data-[state=checked]:border-success peer-data-[state=checked]:bg-gradient-success peer-data-[state=checked]:text-success-foreground peer-data-[state=checked]:shadow-hover group"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center transition-all">
                              <CheckCircle2 className="w-4 h-4 opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                            </div>
                            <span className="flex-1 text-base font-medium">
                              {option}
                            </span>
                            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-success/10 peer-data-[state=checked]:bg-white/20 flex items-center justify-center text-xs font-semibold transition-colors">
                              {String.fromCharCode(65 + oIndex)}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <Card className="shadow-card border-0 bg-gradient-card">
                  <CardContent className="flex justify-between items-center py-6 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center text-success-foreground font-bold text-lg shadow-glow">
                        {Object.keys(qualificationAnswers).length}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Progress</p>
                        <p className="text-xs text-muted-foreground">
                          {Object.keys(qualificationAnswers).length} of {qualificationQuestions.length} answered
                        </p>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-gradient-success hover:opacity-90 shadow-hover text-base font-semibold px-8 py-6 rounded-xl"
                      disabled={Object.keys(qualificationAnswers).length < qualificationQuestions.length}
                    >
                      Submit Test
                      <CheckCircle2 className="ml-2 w-5 h-5" />
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center shadow-elegant border-0 overflow-hidden animate-scale-in">
          <div className="h-2 bg-gradient-success" />
          <CardContent className="pt-16 pb-16 px-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-success mx-auto flex items-center justify-center mb-8 shadow-glow animate-float">
              <CheckCircle2 className="w-12 h-12 text-success-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Thank You!
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Your response has been recorded successfully. We truly appreciate your valuable feedback!
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-card rounded-xl border border-border">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Powered by Survonica</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Page-by-Page Template (Presentation View)
  if (template === "page-by-page") {
    const currentQuestion = survey.questions[currentQuestionIndex];
    const isFirst = currentQuestionIndex === 0;
    const isLast = currentQuestionIndex === survey.questions.length - 1;
    const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background transition-colors duration-500"
        style={{ backgroundColor: survey.design?.backgroundColor }}>

        {/* Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <Card className="w-full max-w-2xl shadow-elegant border-0 animate-fade-in"
          style={{ borderRadius: survey.design?.borderRadius, backgroundColor: survey.design?.formColor }}>
          <CardHeader className="text-center pb-2">
            {survey.design?.logoUrl && (
              <img src={survey.design.logoUrl} alt="Logo" className="h-16 mx-auto object-contain mb-4" />
            )}
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {survey.questions.length}
            </span>
          </CardHeader>

          <CardContent className="space-y-8 p-8 md:p-12">
            <div className="space-y-4">
              {currentQuestion.imageUrl && (
                <img src={currentQuestion.imageUrl} alt="Scene" className="w-full h-64 object-cover rounded-xl shadow-sm mb-6" />
              )}
              <h2 className="text-3xl md:text-4xl font-bold text-center leading-tight" style={{ color: survey.design?.primaryColor }}>
                {currentQuestion.text}
                {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
              </h2>
            </div>

            <div className="pt-4 space-y-4">
              {currentQuestion.type === 'text' && (
                <Input
                  className="text-xl p-6 h-16 rounded-xl border-2 focus-visible:ring-primary"
                  placeholder="Type your answer..."
                  value={responses[currentQuestion.id] || ''}
                  onChange={(e) => setResponses({ ...responses, [currentQuestion.id]: e.target.value })}
                />
              )}

              {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'checkboxes') && (
                <div className="grid gap-3">
                  {currentQuestion.options?.map((opt: string, idx: number) => {
                    const isSelected = responses[currentQuestion.id] === opt;
                    // Note: Simplified logic for presentation view (single select behavior for both for now to ensure flow)
                    return (
                      <div key={idx}
                        onClick={() => setResponses({ ...responses, [currentQuestion.id]: opt })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group ${isSelected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}>
                        <span className="text-lg font-medium">{opt}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-muted'}`}>
                          {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {currentQuestion.type === 'rating' && (
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={() => setResponses({ ...responses, [currentQuestion.id]: i.toString() })}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all text-xl font-bold ${responses[currentQuestion.id] === i.toString() ? 'border-primary bg-primary text-primary-foreground' : 'border-muted hover:border-primary'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-border/50">
              <Button variant="ghost" onClick={() => setCurrentQuestionIndex(curr => Math.max(0, curr - 1))} disabled={isFirst}>
                Back
              </Button>

              {isLast ? (
                <Button onClick={handleSubmit} size="lg" className="bg-primary hover:opacity-90 px-8">Submit Survey</Button>
              ) : (
                <Button onClick={() => setCurrentQuestionIndex(curr => Math.min(survey.questions.length - 1, curr + 1))} size="lg">
                  Next Question
                </Button>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    );
  }

  // DEFAULT FALLBACK: Single Column / Minimalist (Visual Editor Style)
  // This catches "Two Column", "Single Column", "minimalist", or any legacy string.
  const isMinimalist = template === 'minimalist';


  return (
    <div className="min-h-screen py-8 px-4 transition-colors duration-500 flex justify-center bg-gray-50/50"
      style={{ backgroundColor: survey.design?.backgroundColor || '#f9fafb' }}>

      <div className="w-full max-w-3xl space-y-8 p-8 rounded-xl min-h-[600px] shadow-xl backdrop-blur-sm transition-colors duration-300"
        style={{
          borderRadius: isMinimalist ? '0' : (survey.design?.borderRadius || '1rem'),
          backgroundColor: isMinimalist ? 'transparent' : (survey.design?.formColor || '#ffffff'),
          boxShadow: isMinimalist ? 'none' : undefined
        }}>

        {/* Title Area */}
        <div className="text-center space-y-4 mb-8">
          {survey.design?.logoUrl && (
            <img src={survey.design.logoUrl} alt="Logo" className="h-20 mx-auto object-contain mb-6" />
          )}
          <h1 className="text-4xl font-bold text-center" style={{ color: survey.design?.primaryColor || '#000000' }}>
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
              {survey.description}
            </p>
          )}

          {/* Qualification Badge if needed */}
          {survey.require_qualification && !submitted && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-center gap-2 text-orange-700 mx-auto max-w-md">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Qualification Test Required</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" style={{ gap: `${survey.design?.questionSpacing || 1.5}rem` }}>
          {survey.questions.map((question: any, index: number) => (
            <div key={question.id}
              className={`group relative transition-all ${isMinimalist ? 'border-b border-gray-100 pb-12' : 'p-6 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white/50'}`}>

              <div className="space-y-3">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider block mb-2">Question {index + 1}</span>

                {question.imageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                    <img src={question.imageUrl} alt="Scene" className="w-full h-auto max-h-80 object-cover" />
                  </div>
                )}

                <h3 className="text-xl font-medium w-full text-left" style={{ color: '#000000' }}>
                  {question.text}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </h3>

                {/* Input rendering */}
                <div className="pt-2">
                  {question.type === 'text' && (
                    <Input
                      className="h-10 border-b border-gray-300 bg-gray-50/50 rounded-none border-t-0 border-x-0 focus-visible:ring-0 px-0"
                      placeholder="Type your answer here..."
                      value={responses[question.id] || ''}
                      onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                    />
                  )}

                  {(question.type === 'multiple_choice' || question.type === 'checkboxes') && (
                    <div className="space-y-2">
                      {question.options?.map((opt: string, oIndex: number) => {
                        const isSelected = responses[question.id] === opt;
                        return (
                          <div key={oIndex} className="flex items-center gap-3 group/option">
                            <div
                              onClick={() => setResponses({ ...responses, [question.id]: opt })}
                              className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center ${isSelected ? 'border-primary' : 'border-gray-400'}`}
                            >
                              {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <span className="flex-1 text-gray-700 cursor-pointer" onClick={() => setResponses({ ...responses, [question.id]: opt })}>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {question.type === 'rating' && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setResponses({ ...responses, [question.id]: i.toString() })}
                          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${responses[question.id] === i.toString() ? 'bg-primary text-primary-foreground border-primary' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="pt-8 flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md text-base font-semibold px-12 py-6 rounded-full"
            >
              Submit Survey
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 pb-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Powered by Survonica</span>
          </div>
        </div>
      </div>
    </div>
  );
}



export default SurveyResponse;
