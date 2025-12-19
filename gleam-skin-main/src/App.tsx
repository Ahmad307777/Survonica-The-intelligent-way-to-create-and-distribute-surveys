import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateSurvey from "./pages/CreateSurvey";
import MySurveys from "./pages/MySurveys";
import SurveyEditor from "./pages/SurveyEditor";
import SurveyResponse from "./pages/SurveyResponse";
import SurveyResults from "./pages/SurveyResults";
import NotFound from "./pages/NotFound";
import QualificationTest from "./pages/QualificationTest";
import QualityControl from "./pages/QualityControl";
import CreateQualificationTest from "./pages/CreateQualificationTest";
import AiSurveyAssistant from "./pages/AiSurveyAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateSurvey />} />
          <Route path="/ai-assistant" element={<AiSurveyAssistant />} />
          <Route path="/surveys" element={<MySurveys />} />
          <Route path="/editor/:id" element={<SurveyEditor />} />
          <Route path="/survey-editor" element={<SurveyEditor />} />
          <Route path="/quality-control" element={<QualityControl />} />
          <Route path="/create-qualification-test" element={<CreateQualificationTest />} />
          <Route path="/qualification/:surveyId" element={<QualificationTest />} />
          <Route path="/survey/:id" element={<SurveyResponse />} />
          <Route path="/results/:id" element={<SurveyResults />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
