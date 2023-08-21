from gtts import gTTS
import time

# Read text from file
input_text_file = 'output.txt'
with open(input_text_file, 'r', encoding='utf-8') as file:
    text = file.read()

# Generate audio
start_time = time.time()
tts = gTTS(text, lang = 'en-GB')
end_time = time.time()
print(f'Generated audio in {end_time - start_time} seconds')

# Save audio to a file
output_audio_file = 'TTSoutput.mp3'
tts.save(output_audio_file)

print(f'Generated audio saved to {output_audio_file}')
