// check that it picks the correct tool when given options
import { dadJokeToolDefinition } from "../../src/tools/dadJoke";
import { redditToolDefinition } from "../../src/tools/reddit";
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

// combine all tool defs into one variable
const allTools = [
    redditToolDefinition,
    generateImageToolDefinition,
    dadJokeToolDefinition
]

// run evaluation fcn given inputs
runEval('allTools', {
    task: (input) => runLLM ({
        messages: [{ role: 'user', content: input}],
        tools : allTools,
    }),
    data: [
        {
        input: 'tell me a funny dad joke please',
        expected: createToolCallMessage(dadJokeToolDefinition.name)
        },
        {
        input: 'get me a fun reddit post',
        expected: createToolCallMessage(redditToolDefinition.name)
        },
        {
        input: 'take a photo of a bird',
        expected: createToolCallMessage(generateImageToolDefinition.name)
        },
    ],
    scorers: [ToolCallMatch],
})