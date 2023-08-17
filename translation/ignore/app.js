const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;

const client = new OpenAI({apiKey : apiKey});

async function transcribeAudio() {
  const audioFile = await fs.readFile('harvard.wav');

  const response = await client.whisper.transcribe({
    file: audioFile,
    model: 'whisper-1',
  });

  console.log(response.text);
}

transcribeAudio();