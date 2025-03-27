import { generateImageToolDefinition } from "../../src/tools/generateImage";
import { runEval } from "../evalTools";
import { ToolCallMatch } from "../scorers";
import { runLLM } from "../../src/llm";

// get the shape of the results inthe reddit object
const createToolCallMessage = (toolName:string) => ({
    role: 'assistant',
    tool_calls: [{
        type: 'function',
        function: { name: toolName},
    }]



})

runEval('generateImage', {
    task: (input) => runLLM ({
        messages: [{ role: 'user', content: input}],
        tools : [generateImageToolDefinition],
    }),
    data: [{
        input: 'draw me an image of a cute bird',
        expected: createToolCallMessage(generateImageToolDefinition.name)
        },
        {
        input: 'take a photo of the bird',
        expected: createToolCallMessage(generateImageToolDefinition.name)
        }
    ],
    scorers: [ToolCallMatch],
})