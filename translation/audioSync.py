from gtts import gTTS
from pydub import AudioSegment
import time
import pyrubberband as pyrb
import soundfile as sf

startTime = time.time()
# Read text from file
input_text_file = 'output.srt'
with open(input_text_file, 'r', encoding='utf-8') as file:
    text = file.readlines()

current = [0.00, 0.00] # start and end time of current subtitle
previous = [0.00, 0.00] # start and end time of previous subtitle
total = AudioSegment.empty()

print(len(text))

for i in range(0, len(text), 4):
    print(text[i].rstrip("\n"), text[i + 2])
    current = [float(j) for j in text[i + 1].rstrip('\n').split(' --> ')]
    blank = current[0] - previous[1]   # blank time

    if blank > 0:
        # print('blank time: ', blank)
        total += AudioSegment.silent(duration = blank*1000)

    # Generate audio
    if text[i + 2] == '\n' or text[i + 2] == '':
        total += AudioSegment.silent(duration = (current[1] - current[0])*1000)

    else:
        tts = gTTS(text[i + 2], lang='en-GB')
        tts.save("tmp.mp3")

        generated_audio = AudioSegment.from_mp3("tmp.mp3")
        generated_audio_duration = generated_audio.duration_seconds
        required_audio_duration = current[1] - current[0]
        #print(generated_audio_duration, required_audio_duration)

        # Hardcoded input audio file name
        input_audio_file = "tmp.mp3"

        # Convert the input audio to WAV format
        sound = AudioSegment.from_mp3(input_audio_file)
        sound.export("file.wav", format="wav")

        # Read the WAV file
        y, sr = sf.read("file.wav")

        # Stretch the audio
        stretch_factor = required_audio_duration / generated_audio_duration
        y_stretch = pyrb.time_stretch(y, sr, 1/stretch_factor)

        # Save the stretched audio as "pyrbout.wav"
        output_audio_file = "pyrb_out.wav"
        sf.write(output_audio_file, y_stretch, sr, format='wav')
        # print('Audio stretched by a factor of ', stretch_factor)

        total += AudioSegment.from_wav(output_audio_file)


    previous = current

total.export("final.wav", format="wav")

endTime = time.time()

print('Time taken: ', endTime - startTime)