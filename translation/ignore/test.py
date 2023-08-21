import soundfile as sf
import pyrubberband as pyrb
from pydub import AudioSegment

# Hardcoded input audio file name
input_audio_file = "test.mp3"

# Convert the input audio to WAV format
sound = AudioSegment.from_mp3(input_audio_file)
sound.export("file.wav", format="wav")

# Read the WAV file
y, sr = sf.read("file.wav")

# Stretch the audio by 1.1 times
stretch_factor = 1.001
y_stretch = pyrb.time_stretch(y, sr, 1/stretch_factor)

# Save the stretched audio as "pyrbout.wav"
output_audio_file = "pyrbout.wav"
sf.write(output_audio_file, y_stretch, sr, format='wav')

# Calculate and print the lengths of the original and stretched audio
original_length = len(y) / sr
stretched_length = len(y_stretch) / sr
print(f"Original audio length: {original_length:.5f} seconds")
print(f"Stretched audio length: {stretched_length:.5f} seconds")
