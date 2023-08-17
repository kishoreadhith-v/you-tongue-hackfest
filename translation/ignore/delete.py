from gtts import gTTS
from pydub import AudioSegment
import time
import pyrubberband as pyrb
import soundfile as sf

total = AudioSegment.empty()
total += AudioSegment.silent(duration =  5)

total.export("blankTest.wav", format="wav")
