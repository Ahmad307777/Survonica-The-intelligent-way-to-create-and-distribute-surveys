import { useState, useEffect } from "react";
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
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [template, setTemplate] = useState<string>("Single Column");
  
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

  // Load survey data from localStorage (for preview)
  const [survey, setSurvey] = useState({
    title: "Customer Satisfaction Survey",
    description: "Help us improve by sharing your feedback",
    questions: [
      {
        id: "1",
        type: "multiple-choice",
        text: "How satisfied are you with our service?",
        required: true,
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
      },
      {
        id: "2",
        type: "text",
        text: "What did you like most about our service?",
        required: false,
      },
      {
        id: "3",
        type: "paragraph",
        text: "How can we improve?",
        required: true,
      },
      {
        id: "4",
        type: "multiple-choice",
        text: "Would you recommend us to others?",
        required: true,
        options: ["Definitely", "Probably", "Not Sure", "Probably Not", "Definitely Not"]
      }
    ]
  });

  useEffect(() => {
    const savedSurvey = localStorage.getItem('previewSurvey');
    if (savedSurvey) {
      try {
        const parsed = JSON.parse(savedSurvey);
        setSurvey({
          title: parsed.title || survey.title,
          description: parsed.description || survey.description,
          questions: parsed.questions || survey.questions
        });
        setTemplate(parsed.template || "Single Column");
        
        // Load qualification settings
        if (parsed.requireQualification && parsed.qualificationQuestions?.length > 0) {
          setRequireQualification(true);
          setQualificationQuestions(parsed.qualificationQuestions);
          setPassScore(parsed.passScore || 80);
          setShowingQualification(true);
        }
      } catch (e) {
        console.error('Failed to load survey:', e);
      }
    }
  }, []);

  const handleQualificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all questions are answered
    if (Object.keys(qualificationAnswers).length < qualificationQuestions.length) {
      toast({
        title: "Please answer all questions",
        description: "All qualification questions must be answered",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate score
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
      toast({
        title: "Qualification Passed!",
        description: `You scored ${scorePercentage}%. You can now proceed to the survey.`,
      });
    } else {
      toast({
        title: "Qualification Not Passed",
        description: `You scored ${scorePercentage}%. Required: ${passScore}%`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check required questions
    const requiredQuestions = survey.questions.filter(q => q.required);
    const missingResponses = requiredQuestions.filter(q => !responses[q.id]);
    
    if (missingResponses.length > 0) {
      toast({
        title: "Please answer all required questions",
        description: "Some required questions are still unanswered",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get survey ID from localStorage or URL
      const savedSurvey = localStorage.getItem('previewSurvey');
      let surveyId = null;
      
      if (savedSurvey) {
        const parsed = JSON.parse(savedSurvey);
        surveyId = parsed.id;
      }

      // Format responses for database
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      // Only save if we have a valid survey ID from database
      if (surveyId) {
        const { supabase } = await import('@/integrations/supabase/client');
        
        await supabase.from('survey_responses').insert({
          survey_id: surveyId,
          respondent_email: 'anonymous@example.com', // Would collect in real app
          responses: formattedResponses
        });
      }

      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your response has been submitted successfully",
      });
    } catch (error) {
      console.error('Error submitting survey:', error);
      // Still show success to user even if save fails (for preview mode)
      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your response has been recorded",
      });
    }
  };

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

  // Single Column Template - Modern Professional Design
  if (template === "Single Column") {
    return (
      <div className="min-h-screen bg-gradient-subtle py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Card with Premium Design */}
        <Card className="shadow-elegant border-0 overflow-hidden animate-fade-in">
          <div className="h-2 bg-gradient-primary" />
          <CardHeader className="space-y-6 p-8 bg-gradient-card">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Professional Survey</span>
                <p className="text-sm text-muted-foreground">Powered by Survonica</p>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold font-['Space_Grotesk'] bg-gradient-primary bg-clip-text text-transparent mb-3">
                {survey.title}
              </h1>
              {survey.description && (
                <p className="text-lg text-muted-foreground leading-relaxed">{survey.description}</p>
              )}
            </div>
            <div className="flex items-center gap-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{survey.questions.length}</span>
                </div>
                <span className="text-sm text-muted-foreground">Questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-destructive font-medium">*</span> Required
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Questions with Premium Styling */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((question, index) => (
            <Card key={question.id} className="shadow-card hover:shadow-elegant transition-all duration-300 border-0 overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="h-1 bg-gradient-primary" />
              <CardHeader className="pb-4 bg-gradient-card">
                <CardTitle className="text-xl font-semibold flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                    {index + 1}
                  </span>
                  <span className="flex-1 pt-0.5">
                    {question.text}
                    {question.required && <span className="text-destructive ml-2">*</span>}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-8 px-8">
                {question.type === "multiple-choice" && (
                  <RadioGroup
                    value={responses[question.id]}
                    onValueChange={(value) => setResponses({ ...responses, [question.id]: value })}
                    className="space-y-3"
                  >
                    {question.options?.map((option, idx) => (
                      <div key={option} className="relative">
                        <RadioGroupItem 
                          value={option} 
                          id={`${question.id}-${option}`}
                          className="peer sr-only"
                        />
                        <Label 
                          htmlFor={`${question.id}-${option}`} 
                          className="flex items-center gap-4 w-full px-6 py-5 bg-card border-2 border-border rounded-2xl cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-option-hover hover:scale-[1.02] peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-gradient-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:shadow-hover group"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center transition-all">
                            <CheckCircle2 className="w-4 h-4 opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                          </div>
                          <span className="flex-1 text-base font-medium">
                            {option}
                          </span>
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 peer-data-[state=checked]:bg-white/20 flex items-center justify-center text-xs font-semibold transition-colors">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === "text" && (
                  <Input
                    value={responses[question.id] || ""}
                    onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                    placeholder="Type your answer here..."
                    className="h-14 text-base border-2 focus:border-primary rounded-xl"
                  />
                )}

                {question.type === "paragraph" && (
                  <Textarea
                    value={responses[question.id] || ""}
                    onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                    placeholder="Share your detailed thoughts..."
                    rows={5}
                    className="text-base border-2 focus:border-primary rounded-xl resize-none"
                  />
                )}

                {question.type === "checkboxes" && (
                  <div className="space-y-3">
                    {question.options?.map((option, idx) => {
                      const selectedOptions = responses[question.id]?.split(',').filter(Boolean) || [];
                      const isChecked = selectedOptions.includes(option);
                      
                      return (
                        <div key={option} className="relative">
                          <Checkbox
                            id={`${question.id}-${option}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const currentSelections = responses[question.id]?.split(',').filter(Boolean) || [];
                              let newSelections: string[];
                              
                              if (checked) {
                                newSelections = [...currentSelections, option];
                              } else {
                                newSelections = currentSelections.filter(s => s !== option);
                              }
                              
                              setResponses({ ...responses, [question.id]: newSelections.join(',') });
                            }}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${question.id}-${option}`}
                            className={`flex items-center gap-4 w-full px-6 py-5 bg-card border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-option-hover hover:scale-[1.02] group ${
                              isChecked ? 'border-primary bg-gradient-primary text-primary-foreground shadow-hover' : 'border-border'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                              isChecked ? 'bg-white/20 border-white' : 'border-current'
                            }`}>
                              <CheckCircle2 className={`w-4 h-4 transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                            <span className="flex-1 text-base font-medium">
                              {option}
                            </span>
                            <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                              isChecked ? 'bg-white/20' : 'bg-muted/50 group-hover:bg-primary/10'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {question.type === "rating" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const isSelected = responses[question.id] === rating.toString();
                        return (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setResponses({ ...responses, [question.id]: rating.toString() })}
                            className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                              isSelected 
                                ? 'border-primary bg-gradient-primary text-primary-foreground shadow-hover' 
                                : 'border-border bg-card hover:border-primary hover:shadow-option-hover'
                            }`}
                          >
                            <Star 
                              className={`w-8 h-8 transition-all ${
                                isSelected ? 'fill-current' : ''
                              }`} 
                            />
                            <span className="text-lg font-bold">{rating}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground px-2">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                )}

                {question.type === "dropdown" && (
                  <Select
                    value={responses[question.id] || ""}
                    onValueChange={(value) => setResponses({ ...responses, [question.id]: value })}
                  >
                    <SelectTrigger className="h-14 text-base border-2 focus:border-primary rounded-xl">
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option) => (
                        <SelectItem key={option} value={option} className="text-base py-3">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>
          ))}

          <Card className="shadow-elegant border-0 bg-gradient-card">
            <CardContent className="flex justify-between items-center py-6 px-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-glow">
                  {Object.keys(responses).length}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Answers Completed</p>
                  <p className="text-xs text-muted-foreground">{Object.keys(responses).length} of {survey.questions.length} questions</p>
                </div>
              </div>
              <Button 
                type="submit" 
                size="lg"
                className="bg-gradient-primary hover:opacity-90 transition-all shadow-hover text-base font-semibold px-8 py-6 rounded-xl"
              >
                Submit Survey
                <CheckCircle2 className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </form>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-8 pb-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Powered by Survonica - Professional Survey Platform</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Two Column Template - Modern Split Layout
  if (template === "Two Column") {
    return (
      <div className="min-h-screen bg-background">
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* Left Panel - Sticky Info */}
          <div className="bg-gradient-primary p-8 lg:p-12 flex flex-col justify-center text-primary-foreground lg:sticky lg:top-0 lg:h-screen">
            <div className="max-w-lg">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold mb-4 font-['Space_Grotesk']">{survey.title}</h1>
              {survey.description && (
                <p className="text-lg text-primary-foreground/80 mb-8">{survey.description}</p>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-primary-foreground/90">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                    {survey.questions.length}
                  </div>
                  <span>Questions to answer</span>
                </div>
                <div className="flex items-center gap-3 text-primary-foreground/90">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">⏱️</div>
                  <span>Takes about 3-5 minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Questions */}
          <div className="bg-muted/30 p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
              {survey.questions.map((question, index) => (
                <Card key={question.id} className="shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <Label className="text-base font-semibold mb-4 block">
                      {index + 1}. {question.text}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </Label>

                    {question.type === "multiple-choice" && (
                      <RadioGroup
                        value={responses[question.id]}
                        onValueChange={(value) => setResponses({ ...responses, [question.id]: value })}
                        className="space-y-3"
                      >
                        {question.options?.map((option, idx) => (
                          <div key={option} className="relative">
                            <RadioGroupItem 
                              value={option} 
                              id={`${question.id}-${option}`}
                              className="peer sr-only"
                            />
                            <Label 
                              htmlFor={`${question.id}-${option}`} 
                              className="flex items-center gap-4 w-full px-6 py-5 bg-card border-2 border-border rounded-2xl cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-option-hover hover:scale-[1.02] peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-gradient-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:shadow-hover group"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center transition-all">
                                <CheckCircle2 className="w-4 h-4 opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                              </div>
                              <span className="flex-1 text-base font-medium">
                                {option}
                              </span>
                              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 peer-data-[state=checked]:bg-white/20 flex items-center justify-center text-xs font-semibold transition-colors">
                                {String.fromCharCode(65 + idx)}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === "text" && (
                      <Input
                        value={responses[question.id] || ""}
                        onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                        placeholder="Your answer"
                        className="mt-2"
                      />
                    )}

                    {question.type === "paragraph" && (
                      <Textarea
                        value={responses[question.id] || ""}
                        onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                        placeholder="Your answer"
                        rows={4}
                        className="mt-2"
                      />
                    )}

                    {question.type === "checkboxes" && (
                      <div className="space-y-3">
                        {question.options?.map((option, idx) => {
                          const selectedOptions = responses[question.id]?.split(',').filter(Boolean) || [];
                          const isChecked = selectedOptions.includes(option);
                          
                          return (
                            <div key={option} className="relative">
                              <Checkbox
                                id={`${question.id}-${option}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentSelections = responses[question.id]?.split(',').filter(Boolean) || [];
                                  let newSelections: string[];
                                  
                                  if (checked) {
                                    newSelections = [...currentSelections, option];
                                  } else {
                                    newSelections = currentSelections.filter(s => s !== option);
                                  }
                                  
                                  setResponses({ ...responses, [question.id]: newSelections.join(',') });
                                }}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`${question.id}-${option}`}
                                className={`flex items-center gap-4 w-full px-6 py-5 bg-card border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-option-hover hover:scale-[1.02] group ${
                                  isChecked ? 'border-primary bg-gradient-primary text-primary-foreground shadow-hover' : 'border-border'
                                }`}
                              >
                                <div className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isChecked ? 'bg-white/20 border-white' : 'border-current'
                                }`}>
                                  <CheckCircle2 className={`w-4 h-4 transition-opacity ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                                </div>
                                <span className="flex-1 text-base font-medium">
                                  {option}
                                </span>
                                <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                                  isChecked ? 'bg-white/20' : 'bg-muted/50 group-hover:bg-primary/10'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.type === "rating" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => {
                            const isSelected = responses[question.id] === rating.toString();
                            return (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setResponses({ ...responses, [question.id]: rating.toString() })}
                                className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                                  isSelected 
                                    ? 'border-primary bg-gradient-primary text-primary-foreground shadow-hover' 
                                    : 'border-border bg-card hover:border-primary hover:shadow-option-hover'
                                }`}
                              >
                                <Star 
                                  className={`w-8 h-8 transition-all ${
                                    isSelected ? 'fill-current' : ''
                                  }`} 
                                />
                                <span className="text-lg font-bold">{rating}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground px-2">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                    )}

                    {question.type === "dropdown" && (
                      <Select
                        value={responses[question.id] || ""}
                        onValueChange={(value) => setResponses({ ...responses, [question.id]: value })}
                      >
                        <SelectTrigger className="h-14 text-base border-2 focus:border-primary rounded-xl">
                          <SelectValue placeholder="Select an option..." />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options?.map((option) => (
                            <SelectItem key={option} value={option} className="text-base py-3">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-between items-center pt-4 pb-8">
                <p className="text-sm text-muted-foreground">
                  {Object.keys(responses).length} / {survey.questions.length} answered
                </p>
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Submit Response
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Card Grid Template - Colorful Playful Design
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-6 py-3 rounded-full mb-6 shadow-elegant">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Survonica Survey</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 font-['Space_Grotesk'] bg-gradient-primary bg-clip-text text-transparent">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{survey.description}</p>
          )}
        </div>

        {/* Questions Grid */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {survey.questions.map((question, index) => (
              <Card 
                key={question.id} 
                className="shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 border-t-4 border-t-primary overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-bl-full"></div>
                <CardHeader className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold mb-3 shadow-sm">
                    {index + 1}
                  </div>
                  <CardTitle className="text-base leading-snug">
                    {question.text}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {question.type === "multiple-choice" && (
                    <RadioGroup
                      value={responses[question.id]}
                      onValueChange={(value) => setResponses({ ...responses, [question.id]: value })}
                      className="space-y-2"
                    >
                      {question.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
                          <RadioGroupItem value={option} id={`${question.id}-${option}`} className="shrink-0" />
                          <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer text-sm flex-1">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "text" && (
                    <Input
                      value={responses[question.id] || ""}
                      onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                      placeholder="Your answer"
                      className="bg-background/50"
                    />
                  )}

                  {question.type === "paragraph" && (
                    <Textarea
                      value={responses[question.id] || ""}
                      onChange={(e) => setResponses({ ...responses, [question.id]: e.target.value })}
                      placeholder="Your answer"
                      rows={3}
                      className="bg-background/50 resize-none"
                    />
                  )}

                  {question.type === "checkboxes" && (
                    <div className="space-y-2">
                      {question.options?.map((option) => {
                        const selectedOptions = responses[question.id]?.split(',').filter(Boolean) || [];
                        const isChecked = selectedOptions.includes(option);
                        
                        return (
                          <div key={option} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 transition-colors">
                            <Checkbox
                              id={`${question.id}-${option}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const currentSelections = responses[question.id]?.split(',').filter(Boolean) || [];
                                let newSelections: string[];
                                
                                if (checked) {
                                  newSelections = [...currentSelections, option];
                                } else {
                                  newSelections = currentSelections.filter(s => s !== option);
                                }
                                
                                setResponses({ ...responses, [question.id]: newSelections.join(',') });
                              }}
                            />
                            <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer text-sm flex-1">
                              {option}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {question.type === "rating" && (
                    <div className="flex items-center justify-between gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const isSelected = responses[question.id] === rating.toString();
                        return (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setResponses({ ...responses, [question.id]: rating.toString() })}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/10 scale-110' 
                                : 'border-border hover:border-primary'
                            }`}
                          >
                            <Star className={`w-5 h-5 ${isSelected ? 'fill-primary text-primary' : ''}`} />
                            <span className="text-xs font-semibold">{rating}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {question.type === "dropdown" && (
                    <Select
                      value={responses[question.id] || ""}
                      onValueChange={(value) => setResponses({ ...responses, [question.id]: value })}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select an option..." />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Section */}
          <Card className="shadow-elegant bg-gradient-to-r from-card to-accent/20">
            <CardContent className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">Ready to submit?</h3>
                <p className="text-sm text-muted-foreground">
                  Progress: {Object.keys(responses).length} / {survey.questions.length} questions answered
                </p>
              </div>
              <Button 
                type="submit" 
                size="lg"
                className="bg-gradient-primary hover:opacity-90 shadow-sm min-w-[200px]"
              >
                Submit Response
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Survonica - The intelligent way to create surveys</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyResponse;
