import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const AI_SERVICE_API_KEY = Deno.env.get('AI_SERVICE_API_KEY') || Deno.env.get('LOVABLE_API_KEY');

    if (!AI_SERVICE_API_KEY) {
      throw new Error('AI_SERVICE_API_KEY is not configured');
    }

    console.log('Received messages:', messages);

    // Check if user said "done" or similar phrases
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const isDone = lastUserMessage.includes('done') ||
      lastUserMessage.includes('finished') ||
      lastUserMessage.includes('complete') ||
      lastUserMessage.includes('that\'s all') ||
      lastUserMessage.includes("that's it");

    // Build system prompt based on whether user is done
    const systemPrompt = isDone
      ? `You are a survey generation AI. The user has finished describing their survey needs. 
         Based on the conversation history, generate 5-8 relevant survey questions in JSON format.
         
         Return ONLY a JSON object with this structure:
         {
           "questions": [
             {
               "text": "Question text here",
               "type": "multiple-choice",
               "required": true,
               "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
             }
           ]
         }
         
         Question types can be: "multiple-choice", "text", "paragraph", "rating", "checkboxes", "dropdown"
         For multiple-choice, rating, checkboxes, and dropdown, include an "options" array.
         Make questions relevant to their survey topic and ensure variety in question types.`
      : `You are a helpful AI assistant that helps users create surveys. 
         Ask clarifying questions about their survey goals, target audience, and what information they want to collect.
         Be conversational and guide them through the process.
         When they seem ready or say they're "done", let them know you'll generate the survey questions.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    console.log('AI Response:', aiMessage);

    // Try to parse as JSON if user is done
    let parsedQuestions = null;
    if (isDone) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedQuestions = JSON.parse(jsonMatch[0]);
          console.log('Parsed questions:', parsedQuestions);
        }
      } catch (e) {
        console.error('Failed to parse questions JSON:', e);
      }
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        isDone,
        questions: parsedQuestions?.questions || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in survey-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
