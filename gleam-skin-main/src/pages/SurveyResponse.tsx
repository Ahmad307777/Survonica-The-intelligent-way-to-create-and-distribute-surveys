import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, CheckCircle2, Shield, Star, ChevronRight, ChevronLeft, Mic, Printer } from "lucide-react";

/**
 * Helper to convert Hex to HSL
 */
const hexToHSL = (hex: string) => {
  try {
    let r = 0, g = 0, b = 0;
    if (!hex) return "0 0% 0%";

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
    let h = 0, s = 0, l = 0;

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

// --- VOICE INPUT HELPER ---
// Add type definition for Web Speech API
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

const useSpeechRecognition = (onResult: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onResult]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, isSupported, startListening, stopListening };
};


// --- VOICE INPUT HELPER ---
// ... (previous helper code) ...

const VoiceInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition((text) => {
    // Append or replace? Let's append if there's text, or just set if empty.
    const newVal = value ? `${value} ${text}` : text;
    onChange(newVal);
  });

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-50/50 pr-12 transition-all focus:bg-white"
      />
      {isSupported && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`absolute right-1 top-1 h-8 w-8 p-0 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:text-primary hover:bg-primary/10'}`}
          onClick={isListening ? stopListening : startListening}
          title="Dictate answer"
        >
          <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
        </Button>
      )}
    </div>
  );
};

const SurveyResponse = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Load survey data from localStorage (for preview)
  const [survey, setSurvey] = useState<any>(null);
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

  // Pagination / Section State
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Auto-print effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if ((params.get('print') === 'true' || isReviewMode) && !loading && survey) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [loading, survey, isReviewMode]);

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
      if (survey.design.primaryColor) {
        const hsl = hexToHSL(survey.design.primaryColor);
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
      }
      // Assuming simpler BG setting for now
      if (survey.design.borderRadius) {
        root.style.setProperty('--radius', survey.design.borderRadius);
      }
    }
  }, [survey]);

  // Compute Sections dynamically
  const sections = useMemo(() => {
    if (!survey || !survey.questions) return [];

    // Check if we have explicit section headers AND we are in sectional mode
    // (Or if the user wants auto-splitting, but let's stick to template name for now)
    const hasHeaders = survey.questions.some((q: any) => q.type === 'section_header');

    // Only split if headers exist AND template is 'sectional'
    // If template is 'page-by-page', that logic is handled elsewhere (usually rendering 1 q per page)
    // Here we decide section grouping.
    const shouldSplit = hasHeaders && (template === 'sectional');

    if (!shouldSplit) {
      // Everything in one section
      return [{
        title: "Survey",
        questions: survey.questions
      }];
    }

    const result: Array<{ title: string, questions: any[] }> = [];
    let currentQuestions: any[] = [];
    let currentTitle = "Start";

    survey.questions.forEach((q: any) => {
      if (q.type === 'section_header') {
        if (currentQuestions.length > 0) {
          result.push({ title: currentTitle, questions: currentQuestions });
        }
        currentQuestions = [];
        currentTitle = q.text || "Section";
      } else {
        currentQuestions.push(q);
      }
    });

    if (currentQuestions.length > 0) {
      result.push({ title: currentTitle, questions: currentQuestions });
    } else if (result.length === 0) {
      // Should rarely happen unless survey purely headers
      result.push({ title: "Start", questions: [] });
    }

    return result;
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
      if (qualificationAnswers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    const scorePercentage = Math.round((correctAnswers / qualificationQuestions.length) * 100);
    if (scorePercentage >= passScore) {
      setQualificationPassed(true);
      setShowingQualification(false);
      toast({ title: "Passed!", description: `Score: ${scorePercentage}%. Proceeding to survey.` });
    } else {
      toast({ title: "Failed", description: `Score: ${scorePercentage}%. Required: ${passScore}%`, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Loop through ALL questions in the survey (not just current page) to validate "required"
    let missing = false;
    survey.questions.forEach((q: any) => {
      // ignore section headers
      if (q.type !== 'section_header' && q.required && !responses[q.id]) {
        missing = true;
      }
    });

    if (missing) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill out all required fields before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (id) {
        const response = await fetch('http://localhost:8000/api/survey-responses/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            survey_id: id,
            respondent_email: respondentEmail || "anonymous@example.com",
            responses: responses
          }),
        });
        if (response.ok) {
          setSubmitted(true);
        }
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNextSection = () => {
    // Validate current section requirements
    const currentQ = sections[currentSectionIndex].questions;
    let missing = false;
    currentQ.forEach(q => {
      if (q.required && !responses[q.id]) missing = true;
    });

    if (missing) {
      toast({
        title: "Required Fields Missing",
        description: "Please complete all required questions on this page.",
        variant: "destructive"
      });
      return;
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Survey Not Found</h2>
        </Card>
      </div>
    );
  }

  // 1. Email Gate
  if (isRestricted && !emailValidated) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-elegant border-0 animate-fade-in">
          <CardHeader className="text-center"><CardTitle>Restricted Access</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit}>
              <Input type="email" value={respondentEmail} onChange={e => setRespondentEmail(e.target.value)} required placeholder="Enter your email" className="mb-4" />
              <Button className="w-full">Verify & Continue</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Qualification
  if (showingQualification && !qualificationPassed) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-16 px-4">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center"><CardTitle>Qualification Test</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleQualificationSubmit} className="space-y-6">
              {qualificationQuestions.map((q, idx) => (
                <div key={idx}>
                  <p className="font-semibold mb-2">{idx + 1}. {q.question}</p>
                  <RadioGroup onValueChange={val => setQualificationAnswers({ ...qualificationAnswers, [idx]: parseInt(val) })}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center space-x-2"><RadioGroupItem value={oIdx.toString()} id={`q${idx}-${oIdx}`} /><Label htmlFor={`q${idx}-${oIdx}`}>{opt}</Label></div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <Button type="submit" className="w-full">Submit Test</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 3. Submitted State
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center shadow-lg animate-scale-in">
          <CardContent className="pt-16 pb-16 px-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-green-600" /></div>
            <h2 className="text-3xl font-bold mb-3">Thank You!</h2>
            <p className="text-muted-foreground mb-8">Your response has been recorded.</p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setIsReviewMode(true);
                  setSubmitted(false);
                }}
                className="w-full bg-gradient-primary"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print My Response
              </Button>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Create Your Own Survey
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Survey Render
  const isMinimalist = template === 'minimalist';
  const currentSection = sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  return (
    <div className="min-h-screen py-8 px-4 transition-colors duration-500 flex justify-center bg-gray-50/50"
      style={{ backgroundColor: survey.design?.backgroundColor || '#f9fafb' }}>

      <div className="w-full max-w-3xl space-y-8 p-8 rounded-xl min-h-[600px] shadow-xl backdrop-blur-sm transition-colors duration-300"
        style={{
          borderRadius: isMinimalist ? '0' : (survey.design?.borderRadius || '1rem'),
          backgroundColor: isMinimalist ? 'transparent' : (survey.design?.formColor || '#ffffff'),
          boxShadow: isMinimalist ? 'none' : undefined
        }}>

        {/* Header */}
        <div className="text-center space-y-4 mb-4">
          {survey.design?.logoUrl && (<img src={survey.design.logoUrl} alt="Logo" className="h-20 mx-auto object-contain mb-4" />)}
          <h1 className="text-4xl font-bold text-center" style={{ color: survey.design?.primaryColor || '#000000' }}>{survey.title}</h1>
          {survey.description && (<p className="text-lg text-muted-foreground text-center">{survey.description}</p>)}
        </div>

        {/* Progress Bar (Only if multiple sections) */}
        {sections.length > 1 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
            ></div>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Page {currentSectionIndex + 1} of {sections.length}
            </p>
          </div>
        )}

        {/* Section Title */}
        {sections.length > 1 && (
          <div className="pb-4 border-b border-gray-100 mb-6">
            <h2 className="text-2xl font-semibold text-primary">{currentSection.title}</h2>
          </div>
        )}

        {/* Questions Form */}
        <div className="space-y-6" style={{ gap: `${survey.design?.questionSpacing || 1.5}rem` }}>
          {currentSection.questions.map((question: any, index: number) => (
            <div key={question.id} className={`group relative ${isMinimalist ? 'border-b border-gray-100 pb-12' : 'p-6 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white/50'}`}>
              <div className="space-y-3">
                <h3 className="text-xl font-medium" style={{ color: '#000000' }}>
                  {question.text} {question.required && <span className="text-destructive">*</span>}
                </h3>
                <div className="pt-2">
                  {/* Text Input */}
                  {question.type === 'text' && (
                    <VoiceInput
                      value={responses[question.id] || ''}
                      onChange={(val) => setResponses({ ...responses, [question.id]: val })}
                      placeholder="Type or speak your answer..."
                    />
                  )}
                  {/* Multiple Choice */}
                  {(question.type === 'multiple_choice' || question.type === 'checkboxes') && (
                    <div className="space-y-2">
                      {question.options?.map((opt: string, idx: number) => {
                        const isSelected = responses[question.id] === opt;
                        return (
                          <div key={idx} onClick={() => setResponses({ ...responses, [question.id]: opt })}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                            <div className={`w-4 h-4 rounded-full border ${isSelected ? 'border-primary bg-primary' : 'border-gray-400'}`} />
                            <span>{opt}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {/* Rating */}
                  {question.type === 'rating' && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} type="button" onClick={() => setResponses({ ...responses, [question.id]: i.toString() })}
                          className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold ${responses[question.id] === i.toString() ? 'bg-primary text-primary-foreground' : 'text-gray-500 hover:bg-gray-100'}`}>
                          {i}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Yes No */}
                  {question.type === 'yes_no' && (
                    <div className="flex gap-4">
                      {['Yes', 'No'].map(opt => (
                        <Button key={opt} type="button" variant={responses[question.id] === opt ? 'default' : 'outline'}
                          onClick={() => setResponses({ ...responses, [question.id]: opt })} className="w-24">
                          {opt}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Hide in Review Mode */}
        {!isReviewMode && (
          <div className="pt-8 flex justify-between items-center border-t border-gray-100 mt-8 print:hidden">
            <Button
              variant="outline"
              onClick={handlePrevSection}
              disabled={isFirstSection}
              className={isFirstSection ? 'invisible' : ''}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {isLastSection ? (
              <Button onClick={handleSubmit} size="lg" className="px-8">
                Submit Survey <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNextSection} size="lg">
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <div className="flex items-center justify-center gap-2"><Sparkles className="w-4 h-4 text-primary" /><span>Powered by Survonica</span></div>
        </div>

      </div>
    </div>
  );
};

export default SurveyResponse;
