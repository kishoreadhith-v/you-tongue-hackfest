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
from tqdm import tqdm

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

