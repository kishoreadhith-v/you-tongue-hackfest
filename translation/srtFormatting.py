import re

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

def main():
    input_file_path = "outputCopy.srt"  # Replace with the path to your SRT file
    
    # Read the content of the SRT file
    with open(input_file_path, 'r') as file:
        srt_content = file.read()

    # Find and replace the timestamps using regular expressions
    new_srt_content = re.sub(r'(\d+\.\d+) --> (\d+\.\d+)', lambda m: f"{convert_timestamp(m.group(1))} --> {convert_timestamp(m.group(2))}", srt_content)

    # Write the modified content back to the same file
    with open(input_file_path, 'w') as file:
        file.write(new_srt_content)

if __name__ == "__main__":
    main()
