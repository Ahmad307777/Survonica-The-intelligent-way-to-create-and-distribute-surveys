import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, X, Merge } from "lucide-react";

export interface DuplicateGroup {
    indices: number[];
    questions: string[];
    similarity: number;
    suggestion: string;
}

interface RedundancyCheckerProps {
    duplicates: DuplicateGroup[];
    onRemove: (index: number) => void;
    onMerge: (indices: number[]) => void;
}

export function RedundancyChecker({ duplicates, onRemove, onMerge }: RedundancyCheckerProps) {
    if (duplicates.length === 0) {
        return null;
    }

    return (
        <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-orange-900">
                            Redundant Questions Detected
                        </h3>
                        <p className="text-sm text-orange-700">
                            Found {duplicates.length} group(s) of similar questions
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {duplicates.map((group, groupIndex) => (
                        <Alert key={groupIndex} className="bg-white border-orange-300">
                            <AlertDescription>
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-orange-900">
                                        {group.suggestion}
                                    </p>

                                    <div className="space-y-2">
                                        {group.questions.map((question, qIndex) => (
                                            <div
                                                key={qIndex}
                                                className="flex items-start justify-between gap-3 p-3 bg-orange-50 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <span className="text-xs font-semibold text-orange-700">
                                                        Question {group.indices[qIndex] + 1}
                                                    </span>
                                                    <p className="text-sm text-gray-700 mt-1">{question}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onRemove(group.indices[qIndex])}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onMerge(group.indices)}
                                            className="text-orange-700 border-orange-300 hover:bg-orange-50"
                                        >
                                            <Merge className="w-4 h-4 mr-2" />
                                            Merge Questions
                                        </Button>
                                        <span className="text-xs text-orange-600 flex items-center">
                                            {Math.round(group.similarity * 100)}% similar
                                        </span>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
