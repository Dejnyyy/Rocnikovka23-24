import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { searchSpotifySongs, getAccessToken } from '../utils/spotifyApi';

const SearchForm: React.FC = () => {

  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const getArtistsNames = (track: any): string => {
    if (track.artists && track.artists.length > 0) {
      return track.artists.map((artist: any) => artist.name).join(', ');
    } else {
      return 'Unknown Artist';
    }
  };

  const handleSearch = async () => {
    try {

      // Update this line based on the actual structure of your session object
      console.log(session?.user);
      let accessToken = await getAccessToken("8ad546d15e0c498db993f5f2899ae835","c4a7ca1b8c404757b70e5e5c147bb51c" );
     
      if (accessToken) {
        const result = await searchSpotifySongs(searchQuery, accessToken);
        setSearchResults(result.tracks.items);
      }
      else{
        console.log("no access token");
        //getAccessToken();
        console.log(accessToken);
       }
    }  catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <input
        className="rounded-md text-black py-1 m-3 pl-2"
        type="text"
        placeholder='Search for a song...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className='m-auto' onClick={handleSearch}>Search</button>
      {searchResults.map((song) => (
         <li className='list-none px-2 flex items-center m-2 cursor-pointer rounded hover:bg-gray-500 ' key={song.id}>
            <img
            src={song.album.images[2]?.url || 'default-image-url'} // Replace 'default-image-url' with a URL for a default image
            alt={`Album cover for ${song.name}`}
            className='song-image'
          />
          <div className='mx-2'>
          <strong className='w-auto'>{song.name}</strong>
          <br></br>
            <span className='w-auto text-gray-400'>{getArtistsNames(song)}</span>
          </div>
             </li> 
      ))}
    </div>
  );
};

export default SearchForm;
