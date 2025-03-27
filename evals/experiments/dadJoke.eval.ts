import { dadJokeToolDefinition } from "../../src/tools/dadJoke";
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

runEval('dadJoke', {
    task: (input) => runLLM ({
        messages: [{ role: 'user', content: input}],
        tools : [dadJokeToolDefinition],
    }),
    data: [{
        input: 'tell me a funny dad joke please',
        expected: createToolCallMessage(dadJokeToolDefinition.name)
        }
    ],
    scorers: [ToolCallMatch],
})