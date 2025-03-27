import { redditToolDefinition } from "../../src/tools/reddit";
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

runEval('reddit', {
    task: (input) => runLLM ({
        messages: [{ role: 'user', content: input}],
        tools : [redditToolDefinition],
    }),
    data: [{
        input: 'find me something interesting from reddit',
        expected: createToolCallMessage(redditToolDefinition.name)
        }],
    scorers: [ToolCallMatch],
})