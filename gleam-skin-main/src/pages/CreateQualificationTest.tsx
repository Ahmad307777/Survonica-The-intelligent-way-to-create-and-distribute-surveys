import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Plus, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface QualificationQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

export default function QualificationTestPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const surveyData = location.state?.surveyData;
    const [topic, setTopic] = useState("Pre-Qualification Test");
    const [questions, setQuestions] = useState<QualificationQuestion[]>([
        { question: "", options: ["", "", "", ""], correctAnswer: 0 }
    ]);
    const [saving, setSaving] = useState(false);

    const addQuestion = () => {
        setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: keyof QualificationQuestion, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex] = value;
        setQuestions(updated);
    };

    const handleSave = async () => {
        // Validate
        const invalidQuestions = questions.filter(q =>
            !q.question.trim() || q.options.some(o => !o.trim())
        );

        if (invalidQuestions.length > 0) {
            toast({
                title: "Validation Error",
                description: "Please fill in all questions and options",
                variant: "destructive"
            });
            return;
        }

        setSaving(true);
        try {
            // First create the survey
            const survey = await api.createSurvey({
                ...surveyData,
                require_qualification: true,
                qualification_pass_score: 80
            });

            // Then create qualification test using direct fetch
            const response = await fetch('http://localhost:8000/api/qualification-tests/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    survey_id: survey.id,
                    topic,
                    questions
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create qualification test');
            }

            toast({
                title: "Success!",
                description: "Survey and qualification test created successfully"
            });

            // Redirect back to editor with data and preview mode enabled
            navigate("/survey-editor", {
                state: {
                    surveyData: {
                        ...surveyData,
                        require_qualification: true,
                        // Update with created survey ID if needed, but we pass full data for editor
                    },
                    template: surveyData.template, // Ensure template is passed back
                    showPreview: true
                }
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create qualification test",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-subtle py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-elegant">
                    <div className="h-2 bg-gradient-success" />
                    <CardHeader className="bg-gradient-card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-success flex items-center justify-center">
                                <Shield className="w-7 h-7 text-success-foreground" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Create Qualification Test</CardTitle>
                                <CardDescription>
                                    Set up pre-qualification questions to filter respondents
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-6">
                        <div>
                            <Label htmlFor="topic">Test Topic</Label>
                            <Input
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., Product Knowledge Test"
                                className="mt-2"
                            />
                        </div>

                        <div className="space-y-6">
                            {questions.map((q, qIndex) => (
                                <Card key={qIndex} className="border-2">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="font-semibold text-lg">Question {qIndex + 1}</h3>
                                            {questions.length > 1 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removeQuestion(qIndex)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <Label>Question Text</Label>
                                                <Input
                                                    value={q.question}
                                                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                    placeholder="Enter your question..."
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <Label>Options</Label>
                                                <div className="space-y-3 mt-2">
                                                    {q.options.map((option, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-3">
                                                            <Checkbox
                                                                checked={q.correctAnswer === oIndex}
                                                                onCheckedChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                            />
                                                            <Input
                                                                value={option}
                                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                placeholder={`Option ${oIndex + 1}`}
                                                                className="flex-1"
                                                            />
                                                            {q.correctAnswer === oIndex && (
                                                                <Check className="w-5 h-5 text-green-600" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Check the box next to the correct answer
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Button
                            onClick={addQuestion}
                            variant="outline"
                            className="w-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                        </Button>

                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-gradient-success"
                            >
                                {saving ? "Saving..." : "Save & Publish Survey"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
