import sys
import json
from ytmusicapi import YTMusic

def get_stream_url(video_id):
    try:
        ytmusic = YTMusic()
        song_info = ytmusic.get_song(video_id)
        print(json.dumps(song_info))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        get_stream_url(sys.argv[1])
    else:
        print(json.dumps({"error": "No video ID provided"}))
