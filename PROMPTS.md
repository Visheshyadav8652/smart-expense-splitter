# AI Prompt History

This project uses prompts embedded in the server code. No other prompt history was provided.

## Expense parsing prompt
Source: [server/routes/ai.js](server/routes/ai.js)

"Extract expense details from the text. Return JSON with: payer, amount, description, members. payer: string name, amount: integer, description: string, members: array of string names. If a field is missing, set it to null."

## Bill parsing prompt
Source: [server/routes/ai.js](server/routes/ai.js)

"Extract bill items and total from the text. Return JSON with: items, totalAmount. items: array of { name, amount } where amount is integer. totalAmount: integer or null."
