import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const QualificationTest = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    loadQualificationTest();
  }, [surveyId]);

  const loadQualificationTest = async () => {
    try {
      // Get survey details
      const { data: survey, error: surveyError } = await supabase
        .from("surveys")
        .select("title, require_qualification, qualification_pass_score")
        .eq("id", surveyId)
        .single();

      if (surveyError) throw surveyError;
      
      if (!survey.require_qualification) {
        navigate(`/survey/${surveyId}?email=${email}`);
        return;
      }

      setSurveyTitle(survey.title);

      // Check if already qualified
      if (email) {
        const { data: qualification } = await supabase
          .from("respondent_qualifications")
          .select("*")
          .eq("survey_id", surveyId)
          .eq("respondent_email", email)
          .single();

        if (qualification?.passed) {
          toast.success("You're already qualified for this survey!");
          navigate(`/survey/${surveyId}?email=${email}`);
          return;
        }
      }

      // Load qualification test
      const { data: test, error: testError } = await supabase
        .from("qualification_tests")
        .select("*")
        .eq("survey_id", surveyId)
        .single();

      if (testError) throw testError;

      if (test && Array.isArray(test.questions)) {
        setQuestions(test.questions as unknown as Question[]);
      }
    } catch (error) {
      console.error("Error loading qualification test:", error);
      toast.error("Failed to load qualification test");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Email is required to submit the test");
      return;
    }

    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);

    try {
      // Calculate score
      let correctAnswers = 0;
      questions.forEach((q, index) => {
        if (answers[index] === q.correctAnswer) {
          correctAnswers++;
        }
      });

      const scorePercentage = Math.round((correctAnswers / questions.length) * 100);
      setScore(scorePercentage);

      // Get pass threshold
      const { data: survey } = await supabase
        .from("surveys")
        .select("qualification_pass_score, title")
        .eq("id", surveyId)
        .single();

      const passThreshold = survey?.qualification_pass_score || 80;
      const testPassed = scorePercentage >= passThreshold;
      setPassed(testPassed);

      // Save qualification status
      const { error: qualError } = await supabase
        .from("respondent_qualifications")
        .upsert({
          survey_id: surveyId,
          respondent_email: email,
          qualification_name: `Qualified: ${survey?.title || 'Survey'}`,
          score: scorePercentage,
          passed: testPassed,
        });

      if (qualError) throw qualError;

      setShowResults(true);

      if (testPassed) {
        toast.success(`Congratulations! You scored ${scorePercentage}%`);
      } else {
        toast.error(`You scored ${scorePercentage}%. Required: ${passThreshold}%`);
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    navigate(`/survey/${surveyId}?email=${email}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-secondary/20">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            {passed ? (
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <CardTitle className="text-2xl">
              {passed ? "Test Passed!" : "Test Not Passed"}
            </CardTitle>
            <CardDescription>
              Your score: {score}%
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {passed ? (
              <>
                <p className="text-muted-foreground">
                  You've demonstrated sufficient knowledge to participate in this survey.
                </p>
                <Button onClick={handleProceed} size="lg" className="w-full">
                  Proceed to Survey
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                Unfortunately, you need to score higher to participate in this survey. 
                Thank you for your interest.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <p className="text-sm text-muted-foreground">Pre-qualification required</p>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Pre-Qualification Test</CardTitle>
            <CardDescription className="text-base">
              Complete this test to qualify for: <strong className="text-foreground">{surveyTitle}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-10">
              {questions.map((q, qIndex) => (
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
                    value={answers[qIndex]?.toString()}
                    onValueChange={(value) => 
                      setAnswers({ ...answers, [qIndex]: parseInt(value) })
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
                          className="flex items-center gap-4 w-full px-6 py-5 bg-card border-2 border-border rounded-2xl cursor-pointer transition-all duration-200 peer-data-[state=checked]:border-success peer-data-[state=checked]:bg-gradient-success peer-data-[state=checked]:text-success-foreground peer-data-[state=checked]:shadow-sm group"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-current opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                          </div>
                          <span className="flex-1 text-base font-medium">
                            {option}
                          </span>
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 peer-data-[state=checked]:bg-white/20 flex items-center justify-center text-xs font-semibold transition-colors">
                            {String.fromCharCode(65 + oIndex)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}

              <Card className="shadow-card bg-card border-2 border-border">
                <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center text-success-foreground font-bold text-lg shadow-sm">
                      {Object.keys(answers).length}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Progress</p>
                      <p className="text-xs text-muted-foreground">
                        {Object.keys(answers).length} of {questions.length} answered
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submitting || Object.keys(answers).length < questions.length}
                    size="lg"
                    className="bg-success text-success-foreground hover:bg-success/90 shadow-lg text-base font-semibold px-8 py-3 rounded-xl w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Test
                        <CheckCircle2 className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QualificationTest;
