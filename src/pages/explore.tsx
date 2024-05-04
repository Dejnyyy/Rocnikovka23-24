import React, { useState, useEffect } from 'react';
import HamburgerMenu from './components/HamburgerMenu';
import Error from 'next/error';
import Image from 'next/image';

interface Vote {
  createdAt: string;
  song: string;
  artist: string;
  voteType: string;
  imageUrl?: string;
  userId: string;
}

const Explore: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [sortByDateDesc, setSortByDateDesc] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [shownType, setShownType] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch('/api/getVotes');
        if (!response.ok) {
          console.log('Votes fetch failed');
        }
        const votesData: Vote[] = await response.json();
        const votesWithUserDetails = await Promise.all(
          votesData.map(async (vote: Vote) => ({
            ...vote,
            ...await fetchUserDetails(vote.userId),
          }))
        );
        setVotes(votesWithUserDetails);
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };
  
    fetchVotes().catch((error: Error) => console.error('Failed to fetch votes:', error));
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleString('cz-CS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    return formattedDate.replace(',', ', ');
  };

  const sortedVotes = [...votes].sort((a, b) => sortByDateDesc ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  const toggleSortingOrder = () => setSortByDateDesc(!sortByDateDesc);
  const toggleTypeShown = () => setShownType(!shownType);
  const toggleExpanded = (index: number) => setExpandedIndex(expandedIndex === index ? null : index);

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/getUserByUserId?userId=${userId}`);
      if (!res.ok) {
        console.log('User fetch failed');
        return { name: 'Unknown', image: '/default-profile.png' };
      }
      const userData = await res.json();
      return { name: userData.name, image: userData.image };
    } catch (error) {
      console.error('fetchUserDetails error:', error);
      return { name: 'Unknown', image: '/default-profile.png' };
    }
  };

  const sortingButtonText = sortByDateDesc ? "Descendant" : "Ascendant";
  const feedType = shownType ? "World" : "Friends";

  return (
    <div>
      <HamburgerMenu />
      <main className="flex min-h-screen flex-col text-white text-lg font-mono font-semibold" style={{background: 'radial-gradient(circle, #777, #000)'}}>
        <section className="flex justify-end mt-10 mr-10">
          <div>
            <button className='bg-gray-700 px-4 py-2 rounded-lg shadow-lg' onClick={toggleSortingOrder}> Date {sortingButtonText}</button>
            <button className='bg-gray-700 px-4 py-2 rounded-lg shadow-lg' onClick={toggleTypeShown}>Showing: {feedType}</button>
          </div>
        </section>
        <section className='justify-center items-center'>
          <div className='text-center justify-center'>
            <h1 className='text-5xl'>Explore</h1>
          </div>
          <div className='justify-center items-center '>
            <h2 className='text-center text-xl'>All Votes:</h2>
            {shownType ? (
              <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <ul className=''>
                  {sortedVotes.map((vote, index) => (
                    <div key={index} className="bg-gray-700 mx-auto w-3/4 sm:w-2/3 lg:w-1/2 xl:w-1/3 rounded-xl px-4 py-2 m-2" onClick={() => toggleExpanded(index)}>
                      <li className='cursor-pointer'>
                        <div className='flex flex-row'>
                          <Image 
                            src={vote.image || '/default-userimage.png'} 
                            alt='Profile Picture'
                            width={50}
                            height={50}
                            className="rounded-full w-12 h-12"
                          />
                          <p className='my-auto ml-4'>{vote.name}</p>
                        </div>
                        <div className="flex flex-row">
                          <img src={vote.imageUrl} alt={`Cover for ${vote.song}`} className="my-2 rounded-lg ml-1" />
                          <a href={`https://open.spotify.com/search/${encodeURIComponent(vote.song)}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className='ml-4 text-start my-auto'>
                             <p className='ml-4 text-start my-auto hover:underline'>{vote.song}</p>
                          </a>
                        </div>
                        {expandedIndex === index && (
                        <>
                          <p>Artist: {vote.artist}</p>
                          <p className={vote.voteType === '+' ? 'vote-positive' : 'vote-negative'}>+/-: {vote.voteType}</p>
                          <p>{formatDate(vote.createdAt)}</p>
                        </>
                        )}
                      </li>
                    </div>
                  ))}
                </ul>
              </div>
            ) : (
              <p className='text-center text-xl mt-10'>No votes to display</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Explore;
