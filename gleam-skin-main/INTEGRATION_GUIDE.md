# Integration Instructions

## 1. Update src/lib/api.ts

Add these functions to the `api` object (from API_ADDITIONS.txt):

```typescript
// Detect Redundant Questions
detectRedundancy: async (questions: any[]) => {
    const response = await fetchWithCredentials(`${API_URL}/ai/detect-redundancy/`, {
        method: 'POST',
        body: JSON.stringify({ questions }),
    });
    if (!response.ok) throw new Error('Failed to detect redundancy');
    return response.json();
},

// Qualification Test endpoints
createQualificationTest: async (data: any) => {
    const response = await fetchWithCredentials(`${API_URL}/qualification-tests/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create qualification test');
    return response.json();
},

getQualificationTest: async (surveyId: string) => {
    const response = await fetchWithCredentials(`${API_URL}/qualification-tests/?survey=${surveyId}`);
    if (!response.ok) throw new Error('Failed to fetch qualification test');
    return response.json();
},
```

## 2. Update src/App.tsx

Add these routes:

```typescript
import SurveyEditor from "./pages/SurveyEditor";
import CreateQualificationTest from "./pages/CreateQualificationTest";

// In the Routes section:
<Route path="/survey-editor" element={<SurveyEditor />} />
<Route path="/create-qualification-test" element={<CreateQualificationTest />} />
```

## 3. Update CreateSurvey.tsx

Add these imports at the top:

```typescript
import { TemplateSelectionModal } from "@/components/TemplateSelectionModal";
import { RedundancyChecker } from "@/components/RedundancyChecker";
import { api } from "@/lib/api";
```

Add state for redundancy and template:

```typescript
const [duplicates, setDuplicates] = useState([]);
const [showTemplateModal, setShowTemplateModal] = useState(false);
const [checkingRedundancy, setCheckingRedundancy] = useState(false);
```

Add redundancy check function:

```typescript
const handleCheckRedundancy = async () => {
  setCheckingRedundancy(true);
  try {
    const result = await api.detectRedundancy(questions);
    setDuplicates(result.suggestions || []);
    if (result.total_duplicates === 0) {
      toast({
        title: "No Duplicates Found",
        description: "All questions are unique!",
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to check for duplicates",
      variant: "destructive",
    });
  } finally {
    setCheckingRedundancy(false);
  }
};

const handleRemoveQuestion = (index: number) => {
  setQuestions(questions.filter((_, i) => i !== index));
  setDuplicates([]);
};

const handleMergeQuestions = (indices: number[]) => {
  // Keep first question, remove others
  const merged = questions.filter((_, i) => !indices.slice(1).includes(i));
  setQuestions(merged);
  setDuplicates([]);
  toast({
    title: "Questions Merged",
    description: "Duplicate questions have been merged",
  });
};

const handleFinalize = () => {
  setShowTemplateModal(true);
};

const handleTemplateSelect = (templateId: string) => {
  navigate("/survey-editor", {
    state: {
      surveyData: { title, description, questions },
      template: templateId
    }
  });
};
```

Add buttons in the UI (replace "Finalize Survey" button):

```typescript
<div className="space-y-3">
  <Button
    onClick={handleCheckRedundancy}
    disabled={checkingRedundancy || questions.length < 2}
    variant="outline"
    className="w-full"
  >
    {checkingRedundancy ? "Checking..." : "Check Redundancy"}
  </Button>
  
  <Button
    onClick={handleFinalize}
    className="w-full bg-gradient-primary"
  >
    Finalize Survey & Continue to Editor
  </Button>
</div>

{duplicates.length > 0 && (
  <RedundancyChecker
    duplicates={duplicates}
    onRemove={handleRemoveQuestion}
    onMerge={handleMergeQuestions}
  />
)}

<TemplateSelectionModal
  open={showTemplateModal}
  onClose={() => setShowTemplateModal(false)}
  onSelect={handleTemplateSelect}
/>
```

## 4. Flow Summary

1. User creates survey with AI
2. Clicks "Check Redundancy" → Shows duplicate questions
3. User can remove or merge duplicates
4. Clicks "Finalize Survey" → Template selection modal appears
5. Selects template → Goes to Survey Editor
6. In Survey Editor, can toggle "Require Qualification Test"
7. Clicks "Quality Control" → Goes to Create Qualification Test page
8. Creates qualification test → Saves survey with qualification

## Files Created:
- ✅ src/components/TemplateSelectionModal.tsx
- ✅ src/components/RedundancyChecker.tsx
- ✅ src/pages/SurveyEditor.tsx
- ✅ src/pages/CreateQualificationTest.tsx
- ✅ backend/surveys/views/ai_views.py (detect_redundancy)
- ✅ backend/surveys/ai_helper.py (detect_duplicate_questions)
