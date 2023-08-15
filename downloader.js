const fs = require("fs");
const ytdl = require("ytdl-core");

async function downloadVideo(url) {
  const videoId = ytdl.getURLVideoID(url);
  await ytdl.getInfo(videoId).then((info) => {
    console.log(info.videoDetails.title);
    ytdl(url).pipe(
      fs.createWriteStream(
        `../../downloads/videos/${info.videoDetails.title}.mp4`
      )
    );
    ytdl(url, { filter: "audioonly", format: "webm" }).pipe(
      fs.createWriteStream(
        `../../downloads/audio/${info.videoDetails.title}.webm`
      )
    );
  });
}
async function videoInfo(url) {
  try {
    const videoId = ytdl.getURLVideoID(url);
    const info = await ytdl.getInfo(videoId);

    const videoInfo = {
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      views: info.videoDetails.viewCount,
    };

    return videoInfo;
  } catch (error) {
    console.error('Error fetching video info:', error);
    return null; // or throw the error if needed
  }
}


module.exports = { downloadVideo, videoInfo };
