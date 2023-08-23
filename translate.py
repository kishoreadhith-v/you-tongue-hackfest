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
from pytube import YouTube
import argparse
import warnings
from numba.core.errors import NumbaDeprecationWarning



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
        #subprocess.run(ffmpeg_cmd, check=True)
        subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("Audio extraction successful.\n From: {}\n To: {}".format(input_video_path, output_audio_path))
    except subprocess.CalledProcessError as e:
        print("Error occurred while extracting audio:", e)

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

def videoDownload(url):
    # Create a YouTube object using the video URL
    #'https://www.youtube.com/watch?v=Vp9bUxcKec8&list=LL&index=10'
    yt = YouTube(url)

    # Print video metadata
    print("Title:", yt.title)
    print("Author:", yt.author)
    print("Duration:", yt.length, "seconds")
    print("video ID:", yt.video_id)

    # Choose a stream to download (e.g., highest resolution)
    stream = yt.streams.get_highest_resolution()

    # Extract the file extension from the stream's mime_type
    mime_type = stream.mime_type
    file_extension = mime_type.split('/')[-1]

    # Download the video
    print("Downloading...")
    stream.download(output_path= "./")
    print("Download complete!\n")
    return f"{yt.title}.{file_extension}"

def clean_filename(filename):
    # Replace special characters with an empty string
    cleaned_filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    return cleaned_filename



if __name__ == "__main__":

    # Filter out specific warnings
    warnings.filterwarnings("ignore", category=UserWarning, message="FP16 is not supported on CPU")
    warnings.filterwarnings("ignore", category=UserWarning, message="Word-level timestamps on translations may not be reliable")
    warnings.simplefilter("ignore", category=NumbaDeprecationWarning)


    startTime = time.time()
    
    helpMessage = """usage: script_name.py [-h] [-y YOUTUBE] [-l LOCAL] [-t] [-s] [-a] [-v] [-id VIDEO_ID]

Translate a video.

optional arguments:
  -h, --help            show this help message and exit
  -y YOUTUBE, --youtube YOUTUBE
                        link to the youtube video
  -l LOCAL, --local LOCAL
                        path to the local video file
  -t, --timed           print time taken
  -s, --subtitles       generate subtitles and transcript only
  -a, --audio           generate translated audio
  -v, --video           generate translated video
  -id VIDEO_ID, --video_id VIDEO_ID
                        video id
    """
    parser = argparse.ArgumentParser(description='Translate a video.')
    parser.add_argument('-y', '--youtube', type=str, help='link to the youtube video')
    parser.add_argument('-l', '--local', type=str, help='path to the local video file')
    parser.add_argument('-t', '--timed', action='store_true', help='print time taken')
    parser.add_argument('-s', '--subtitles', action='store_true', help='generate subtitles and transcript only')
    parser.add_argument('-a', '--audio', action='store_true', help='generate translated audio')
    parser.add_argument('-v', '--video', action='store_true', help='generate translated video')
    parser.add_argument('-id', '--video_id', type=str, help='video id')
    parser.add_argument('-hm', '--helpme', action='help', default=argparse.SUPPRESS, help = helpMessage)

    args = parser.parse_args()
    link = args.youtube
    local = args.local
    timed = args.timed
    subtitles = args.subtitles
    audio = args.audio
    video = args.video
    video_id = args.video_id


    intermediate_files = []

    if link:
        input_video_path = clean_filename(videoDownload(link))
    
    if local:
        input_video_path = local

    #print(input_video_path, end="\n\n\n")

    output_audio_path = "originalAudio.wav"
    extract_audio_from_video(input_video_path, output_audio_path)

    if subtitles or audio or video:
        model = whisper.load_model("medium")
        result = model.transcribe("originalAudio.wav", task = "translate",  word_timestamps = True)


        transcriptFile = f"{input_video_path[:-4]}_transcript.txt"
        with open(transcriptFile, "w") as txt_file:
            txt_file.write(result["text"])

        srtFile = f"{input_video_path[:-4]}_subtitles.srt"
        data = result
        srt_content = generate_srt_from_segments(data["segments"])
        # Write the SRT content to a file
        with open(srtFile, "w") as srt_file:
            srt_file.write(srt_content)

        intermediate_files.append("originalAudio.wav")

############################################

    if audio or video:
        # Read text from file
        input_text_file = srtFile
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

        audioFile = f"{input_video_path[:-4]}_audio.wav"
        total.export(audioFile, format="wav")
        intermediate_files.extend(["tmp.mp3", "file.wav", "pyrb_out.wav"])

    ##############################

    if subtitles or audio or video:     
        input_file_path = srtFile  # Replace with the path to your SRT file
        
        # Read the content of the SRT file
        with open(input_file_path, 'r') as file:
            srt_content = file.read()

        # Find and replace the timestamps using regular expressions
        new_srt_content = re.sub(r'(\d+\.\d+) --> (\d+\.\d+)', lambda m: f"{convert_timestamp(m.group(1))} --> {convert_timestamp(m.group(2))}", srt_content)

        # Write the modified content back to the same file
        with open(input_file_path, 'w') as file:
            file.write(new_srt_content)

    ##############################

    if video:
        input_video = input_video_path
        input_audio = audioFile
        input_srt = srtFile
        if link:
            output_video = f"./translated-videos/{video_id}.mp4"
            intermediate_files.extend([input_video_path, audioFile, srtFile, transcriptFile])
        if local:
            output_video = f"{input_video_path[:-4]}_translated{input_video_path[-4:]}" #input_video_path.replace("./", "./translated_")
        combine_video_audio_srt(input_video, input_audio, input_srt, output_video)        

    # Delete intermediate files here
    for file in intermediate_files:
        try:
            os.remove(file)
            print(f"Deleted: {file}")
        except OSError as e:
            print(f"Error deleting {file}: {e}")


    endTime = time.time()   
    
    if timed:
        print("Total time taken: ", endTime - startTime)
    warnings.resetwarnings()