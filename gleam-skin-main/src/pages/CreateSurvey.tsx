import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Sparkles, Loader2, Send } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RedundancyChecker, DuplicateGroup } from "@/components/RedundancyChecker";
import { TemplateSelectionModal } from "@/components/TemplateSelectionModal";

interface Question {
  id: string;
  type: string;
  text: string;
  required: boolean;
  options?: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CreateSurvey = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Chat
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI survey assistant powered by Llama 3.1. Tell me about the survey you'd like to create. What's the purpose? Who's your target audience? When you're ready, just say 'done' and I'll generate the questions!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redundancy Check
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [isCheckingRedundancy, setIsCheckingRedundancy] = useState(false);

  // Template Selection
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `${Date.now()}`,
        type: "text",
        text: "",
        required: true,
      },
    ]);
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const checkRedundancy = async () => {
    if (questions.length < 2) {
      toast({
        title: "Not enough questions",
        description: "Add at least 2 questions to check for redundancy",
        variant: "default",
      });
      return;
    }

    setIsCheckingRedundancy(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai/detect-redundancy/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions }),
      });

      if (!response.ok) {
        throw new Error('Failed to check redundancy');
      }

      const result = await response.json();

      if (result.duplicates && result.duplicates.length > 0) {
        setDuplicates(result.suggestions);
        toast({
          title: "Redundancy Detected",
          description: `Found ${result.total_duplicates} sets of similar questions`,
          variant: "destructive",
        });
      } else {
        setDuplicates([]);
        toast({
          title: "No Redundancy",
          description: "Your questions look unique and good to go!",
          variant: "default", // Changed from success to default as success might not exist
        });
      }
    } catch (error) {
      console.error('Redundancy check failed:', error);
      toast({
        title: "Error",
        description: "Failed to check for redundancy",
        variant: "destructive",
      });
    } finally {
      setIsCheckingRedundancy(false);
    }
  };

  const handleRemoveDuplicate = (index: number) => {
    const questionToRemove = questions[index];
    if (questionToRemove) {
      deleteQuestion(questionToRemove.id);
      // Clear duplicates after modification as indices might shift
      setDuplicates([]);
    }
  };

  const handleMergeDuplicates = (indices: number[]) => {
    // Keep the first question, remove others
    // In a real app, you might want to combine them or ask user to select the best one
    const idsToRemove = indices.slice(1).map(idx => questions[idx]?.id).filter(Boolean);

    setQuestions(questions.filter(q => !idsToRemove.includes(q.id)));
    setDuplicates([]); // Clear duplicates after modification

    toast({
      title: "Questions Merged",
      description: "Kept the first question and removed duplicates",
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isChatting) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);

    // Check if user said "done"
    if (userMessage.toLowerCase().includes("done")) {
      setIsGenerating(true);
      try {
        const result = await api.generateSurveyFromChat(newMessages);

        if (result.error) {
          toast({
            title: "Generation failed",
            description: result.detail || "Failed to generate survey",
            variant: "destructive",
          });
          setMessages([...newMessages, {
            role: "assistant",
            content: "I encountered an error generating the survey. Please try again or contact support."
          }]);
          return;
        }

        setTitle(result.title || "Generated Survey");
        const generatedQuestions = result.questions.map((q: any, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          type: q.type || "text",
          text: q.text,
          required: q.required !== undefined ? q.required : true,
          options: q.options,
        }));
        setQuestions(generatedQuestions);
        setShowChatDialog(false);

        toast({
          title: "Survey generated!",
          description: `Created ${generatedQuestions.length} questions`,
        });

        // Reset chat for next time
        setMessages([{
          role: "assistant",
          content: "👋 Hi! I'm your AI survey assistant powered by Llama 3.1. Tell me about the survey you'd like to create. What's the purpose? Who's your target audience? When you're ready, just say 'done' and I'll generate the questions!"
        }]);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to generate survey",
          variant: "destructive",
        });
        setMessages([...newMessages, {
          role: "assistant",
          content: "I encountered an error. Please try again."
        }]);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Continue conversation
    setIsChatting(true);
    try {
      const response = await api.chatWithAI(newMessages);

      setMessages([...newMessages, {
        role: "assistant",
        content: response.response || "I'm here to help you create a survey. Please describe what you need."
      }]);
    } catch (error: any) {
      toast({
        title: "Chat error",
        description: error.message || "Failed to chat with AI",
        variant: "destructive",
      });
      setMessages([...newMessages, {
        role: "assistant",
        content: "Sorry, I'm having trouble responding. Please try again."
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleFinalizeSurvey = () => {
    if (questions.length === 0) {
      toast({
        title: "No questions",
        description: "Please add at least one question",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a survey title",
        variant: "destructive",
      });
      return;
    }

    // Show template selection modal
    setShowTemplateModal(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);

    // Navigate to survey editor with survey data and template
    navigate("/survey-editor", {
      state: {
        surveyData: {
          title,
          description,
          questions: questions.map(({ id, ...rest }) => rest),
        },
        template: templateId,
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent font-['Space_Grotesk']">
              Create New Survey
            </h1>
            <p className="text-muted-foreground mt-2">
              Build your survey manually or chat with AI to generate questions
            </p>
          </div>
          <Button
            onClick={() => setShowChatDialog(true)}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Chat with AI
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter survey title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your survey"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Questions</CardTitle>
              <Button type="button" onClick={addQuestion} size="sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Question
              </Button>
              <Button
                type="button"
                onClick={checkRedundancy}
                variant="outline"
                size="sm"
                disabled={isCheckingRedundancy || questions.length < 2}
              >
                {isCheckingRedundancy ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2 text-orange-500" />
                )}
                Check Redundancy
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <RedundancyChecker
                duplicates={duplicates}
                onRemove={handleRemoveDuplicate}
                onMerge={handleMergeDuplicates}
              />

              {questions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No questions yet. Click "Add Question" or "Chat with AI" to get started.
                </p>
              ) : (
                questions.map((question, index) => (
                  <Card key={question.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <Label>Question {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuestion(question.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(question.id, "text", e.target.value)
                        }
                        placeholder="Enter your question"
                        required
                      />
                      <div className="flex items-center gap-4">
                        <Label htmlFor={`type-${question.id}`}>Type:</Label>
                        <select
                          id={`type-${question.id}`}
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(question.id, "type", e.target.value)
                          }
                          className="border rounded px-3 py-2"
                        >
                          <option value="text">Text</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="rating">Rating</option>
                        </select>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) =>
                              updateQuestion(
                                question.id,
                                "required",
                                e.target.checked
                              )
                            }
                          />
                          Required
                        </label>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/surveys")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFinalizeSurvey}
              className="bg-gradient-primary hover:opacity-90"
            >
              Finalize Survey
            </Button>
          </div>
        </div>
      </div>

      {/* AI Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chat with AI Assistant (Llama 3.1)</DialogTitle>
            <DialogDescription>
              Describe your survey needs in conversation. Say "done" when ready to generate questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-4 min-h-[300px] max-h-[500px]">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                      ? "bg-gradient-primary text-white"
                      : "bg-muted text-foreground border"
                      }`}
                  >
                    {message.role === "assistant" && (
                      <Sparkles className="w-4 h-4 inline mr-2 text-primary" />
                    )}
                    <span className="text-sm whitespace-pre-wrap">{message.content}</span>
                  </div>
                </div>
              ))}
              {(isChatting || isGenerating) && (
                <div className="flex justify-start">
                  <div className="bg-muted border rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    <span className="text-sm">{isGenerating ? "Generating survey..." : "Thinking..."}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message... (say 'done' to generate survey)"
                disabled={isChatting || isGenerating}
                className="flex-1 min-h-[60px] resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isChatting || isGenerating || !input.trim()}
                className="bg-gradient-primary hover:opacity-90 self-end"
              >
                {isChatting || isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleTemplateSelect}
      />
    </DashboardLayout>
  );
};

export default CreateSurvey;