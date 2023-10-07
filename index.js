

// This code is for v4 of the openai package: npmjs.com/package/openai
import OpenAI from "openai";
import * as fs from 'fs';
import * as readline from 'node:readline/promises';  // This uses the promise-based APIs
import { stdin as input, stdout as output } from 'node:process';
import 'dotenv/config'

const API_KEY = process.env.API_KEY;

const openai = new OpenAI({
  apiKey: API_KEY
});

const rl = readline.createInterface({ input, output });
const action = await rl.question('Action ([S]earch/[A]dd): ');
if (action.toLowerCase() === 's') {
 
  let query = await rl.question('Query: ');

  query = query.toLowerCase();
  
  // read all output files

  const files = fs.readdirSync('output');
  const results = [];

  // loop through each file
  for (let file of files) {
    // read contents of file
    const content = fs.readFileSync(`output/${file}`, 'utf8');
    // parse contents of file
    const parsed = JSON.parse(content);
    // check if query is in keywords
    if (parsed.keywords.includes(query)) {
      // add to results
      results.push(file);
    }

    // check if query is in alternatives
    for (let key in parsed.alternatives) {
      if (parsed.alternatives[key].includes(query)) {
        // add to results
        results.push(file);
      }
    }

    
  }
  console.log(results);
}
if (action.toLowerCase() === 'a') {

  const name = await rl.question('Name of file: ');
  const content = await rl.question('Content: ');

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        "role": "system",
        "content": `
          Can you index the following text for search purposes by listing all the
          words that are likely to be queries? Also, for words or combination of
          words representing non-trivial concepts, can you also generate two
          alternatives for each query using words not already in the list? Answer
          only in JSON, with no text.

          Please use the following format
          \`\`\`
          {
              "keywords": [
                  "example",
                  "example 2"
              ],
              alternatives:[
                  "example": ["alt 1", "alt 2"],
                  "example 2":["alt 1", "alt 2"]
              ]
          }
          \`\`\`
        `
      },
      {
        "role": "user",
        "content": content
      }
    ],
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });



  fs.writeFileSync(`output/${name}.json`, JSON.parse(JSON.stringify(response.choices[0].message.content).toLowerCase()), 'utf8', (err) => {});

}
else {}
rl.close();
