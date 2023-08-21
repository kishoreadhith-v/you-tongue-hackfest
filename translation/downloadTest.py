from pytube import YouTube

# Create a YouTube object using the video URL
url = 'https://www.youtube.com/watch?v=Vp9bUxcKec8&list=LL&index=10'
yt = YouTube(url)

# Print video metadata
print("Title:", yt.title)
print("Author:", yt.author)
print("Duration:", yt.length, "seconds")

# Choose a stream to download (e.g., highest resolution)
stream = yt.streams.get_highest_resolution()

# Extract the file extension from the stream's mime_type
mime_type = stream.mime_type
file_extension = mime_type.split('/')[-1]

# Download the video
print("Downloading...")
stream.download(output_path= "./")
print("Download complete!")
print(f"./{yt.title}.{file_extension}")


    #output_video = f"translated_{sys.argv[1]}"
