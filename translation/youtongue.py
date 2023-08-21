import whisper
from gtts import gTTS
from pydub import AudioSegment
import pyrubberband as pyrb
import soundfile as sf
import time
import subprocess
import sys
import re
import os

def convert_timestamp(timestamp):
    # Split the timestamp into seconds and milliseconds parts
    seconds, milliseconds = map(float, timestamp.split('.'))
    
    # Convert seconds to hours, minutes, and seconds
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    
    # Format the timestamp
    formatted_timestamp = f"{hours:02}:{minutes:02}:{seconds:02},{int(milliseconds):03}"
    return formatted_timestamp

def generate_srt_from_segments(segments):
    srt_content = ""
    
    for index, segment in enumerate(segments):
        sequence_number = index + 1
        start_time = "{:.2f}".format(segment["start"])
        end_time = "{:.2f}".format(segment["end"])
        subtitle_text = segment["text"].replace("\n", " ")  # Remove newlines
        
        srt_content += f"{sequence_number}\n{start_time} --> {end_time}\n{subtitle_text}\n\n"
    
    return srt_content

def extract_audio_from_video(input_video_path, output_audio_path):
    # Command to extract audio from the video using ffmpeg
    ffmpeg_cmd = [
        "ffmpeg",
        "-i", input_video_path,   # Input video file path
        "-vn",                    # Disable video recording
        "-acodec", "pcm_s16le",   # Set audio codec to PCM
        "-ar", "44100",           # Set audio sample rate to 44.1 kHz
        "-ac", "2",               # Set audio channels to stereo (2 channels)
        output_audio_path         # Output audio file path
    ]

    try:
        # Run the ffmpeg command
        subprocess.run(ffmpeg_cmd, check=True)
        print("\n\n\nAudio extraction successful.\n From: {}\n To: {}".format(input_video_path, output_audio_path))
    except subprocess.CalledProcessError as e:
        print("\n\n\nError occurred while extracting audio:", e)

def combine_video_audio_srt(input_video, input_audio, input_srt, output_video):
    # FFmpeg command to combine video, audio, and SRT
    ffmpeg_cmd = [
        "ffmpeg",
        "-i", input_video,       # Input video file
        "-i", input_audio,       # Input audio file
        "-i", input_srt,         # Input SRT subtitle file
        "-c:v", "copy",          # Copy video stream without re-encoding
        "-c:a", "aac",           # Encode audio using AAC codec
        "-strict", "experimental",  # Enable experimental codecs
        "-scodec", "mov_text",   # Use mov_text codec for subtitles
        "-map", "0:v:0",         # Map first video stream from input video
        "-map", "1:a:0",         # Map first audio stream from input audio
        "-map", "2:s:0",         # Map first subtitle stream from input SRT
        output_video             # Output video file
    ]

    try:
        # Run the FFmpeg command
        subprocess.run(ffmpeg_cmd, check=True)
        print("Video with replaced audio and subtitles created:", output_video)
    except subprocess.CalledProcessError as e:
        print("Error occurred while combining video, audio, and subtitles:", e)


if __name__ == "__main__":
    startTime = time.time()

    input_video_path = input("\n\n\nEnter the full path of the video:")#sys.argv[1] 
    output_audio_path = "output_audio.wav"

    extract_audio_from_video(input_video_path, output_audio_path)

    model = whisper.load_model("medium")
    result = model.transcribe("output_audio.wav", task = "translate",  word_timestamps = True)


    with open("output.txt", "w") as txt_file:
        txt_file.write(result["text"])

    data = result
    srt_content = generate_srt_from_segments(data["segments"])
    # Write the SRT content to a file
    with open("output.srt", "w") as srt_file:
        srt_file.write(srt_content)

    # Read text from file
    input_text_file = 'output.srt'
    with open(input_text_file, 'r', encoding='utf-8') as file:
        text = file.readlines()

    current = [0.00, 0.00] # start and end time of current subtitle
    previous = [0.00, 0.00] # start and end time of previous subtitle
    total = AudioSegment.empty()

    for i in range(0, len(text), 4):
        #print(text[i].rstrip("\n"), text[i + 2])
        current = [float(j) for j in text[i + 1].rstrip('\n').split(' --> ')]
        blank = current[0] - previous[1]   # blank time

        if blank > 0:
            # print('blank time: ', blank)
            total += AudioSegment.silent(duration = blank*1000)

        # Generate audio
        if text[i + 2] == '\n' or text[i + 2] == '' or text[i + 2] == 'music\n':
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
    ##############################

    input_file_path = "output.srt"  # Replace with the path to your SRT file
    
    # Read the content of the SRT file
    with open(input_file_path, 'r') as file:
        srt_content = file.read()

    # Find and replace the timestamps using regular expressions
    new_srt_content = re.sub(r'(\d+\.\d+) --> (\d+\.\d+)', lambda m: f"{convert_timestamp(m.group(1))} --> {convert_timestamp(m.group(2))}", srt_content)

    # Write the modified content back to the same file
    with open(input_file_path, 'w') as file:
        file.write(new_srt_content)

    ##############################
    input_video = input_video_path #sys.argv[1]
    input_audio = "final.wav"
    input_srt = "output.srt"
    output_video = f"{input_video_path[:-4]}_translated.mp4"

    combine_video_audio_srt(input_video, input_audio, input_srt, output_video)

    # Delete intermediate files here
    intermediate_files = ["output_audio.wav", "tmp.mp3", "file.wav", "final.wav", "output.srt", "output.txt", "pyrb_out.wav"]
    for file in intermediate_files:
        try:
            os.remove(file)
            print(f"Deleted: {file}")
        except OSError as e:
            print(f"Error deleting {file}: {e}")


    endTime = time.time()   
    print("\n\n\nTotal time taken: ", endTime - startTime)
    print("Output video: ", output_video)
    dummy = input("\n\n\nPress any key to exit.")