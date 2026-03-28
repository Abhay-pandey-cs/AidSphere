require('dotenv').config();
const { analyzeSignal } = require('./utils/geminiAnalyzer');

async function test() {
  const mockBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AD//Z";
  console.log("Testing text only...");
  const res1 = await analyzeSignal("There is a fire!");
  console.log("Text only result:", res1);

  console.log("Testing with mock camera image...");
  const res2 = await analyzeSignal("Visual scene scan only. Describe the scene briefly. Is there an absolute, critical physical emergency requiring SOS responders? Be very strict. Focus on physical disaster, fire, accident, or flood.", mockBase64);
  console.log("Image result:", res2);
}

test();
