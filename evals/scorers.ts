import type { Scorer } from 'autoevals'

// create a fcn to score things based on whether the correct tool was requested
export const ToolCallMatch: Scorer<any, {}> = async ({
    //input,    //x
    output,   //y_pred
    expected, //y_actual
}) => {
    // score as 1 (correct retrieval) or 0 (incorrect retrieval)
    const score = 
        output.role === 'assistant' && // ensure its an assistant type
        Array.isArray(output.tool_calls) && // is it actually an array instead of a string
        output.tool_calls.length === 1 && // does it have something inside?
        output.tool_calls[0].function?.name === //is the functions name the same as .... 
            expected.tool_calls[0].function?.name // the expected fcn name?
            ? 1 // if matches, score as 1
            : 0 // if not matches, score as 0

    // return the name of this scorer and the score
    return {
        name: 'ToolCallMatch',
        score,
    }

}