import subprocess

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
    input_video = r"D:\College\YouTongue\whisper\testVideo.mp4"
    input_audio = r"D:\College\YouTongue\whisper\final.wav"
    input_srt = r"D:\College\YouTongue\whisper\outputCopy.srt"
    output_video = "output_video_with_replaced_audio_and_subtitles.mp4"

    combine_video_audio_srt(input_video, input_audio, input_srt, output_video)
