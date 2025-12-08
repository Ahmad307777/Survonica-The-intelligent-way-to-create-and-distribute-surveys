import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface TemplateOption {
    id: string;
    name: string;
    description: string;
    preview: string;
}

const templates: TemplateOption[] = [
    {
        id: "single-column",
        name: "Standard Scroll",
        description: "Classic vertical layout",
        preview: "linear-gradient(to bottom, #e2e8f0, #ffffff)"
    },
    {
        id: "page-by-page",
        name: "Presentation",
        description: "One question at a time",
        preview: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
    },
    {
        id: "minimalist",
        name: "Minimalist Focus",
        description: "Clean, distraction-free",
        preview: "linear-gradient(to bottom, #f8fafc, #f8fafc)"
    }
];

interface TemplateSelectionModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (templateId: string) => void;
}

export function TemplateSelectionModal({ open, onClose, onSelect }: TemplateSelectionModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Choose Survey Template</DialogTitle>
                    <DialogDescription>
                        Select a layout design for your survey questions
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 py-6">
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => {
                                onSelect(template.id);
                                onClose();
                            }}
                            className="group relative flex flex-col items-center gap-3 rounded-xl border-2 border-border p-4 transition-all hover:border-primary hover:shadow-lg"
                        >
                            <div
                                className="w-full aspect-[3/4] rounded-lg shadow-md"
                                style={{ background: template.preview }}
                            />
                            <div className="text-center">
                                <h3 className="font-semibold text-base">{template.name}</h3>
                                <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="w-4 h-4 text-primary-foreground" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
