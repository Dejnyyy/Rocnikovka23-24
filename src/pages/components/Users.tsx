import React, { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import { useSession } from "next-auth/react";
import SearchBar from './SearchBar';

interface UsersPageProps {
  userList: User[];
  onDeleteUser: (userId: string) => void;
}

interface ExtendedUser extends User {
  requestPending: boolean;
  isRequestReceived: boolean;
  isFriend: boolean;
}

const UsersPage: React.FC<UsersPageProps> = ({ userList: initialUserList, onDeleteUser }) => {
  const { data: sessionData } = useSession();
  const [userList, setUserList] = useState<ExtendedUser[]>(initialUserList.map(user => ({
    ...user,
    requestPending: false,
    isRequestReceived: false,
    isFriend: false 
  })));
  const [filteredUserList, setFilteredUserList] = useState<ExtendedUser[]>(userList);

  const isLoggedInUserAdmin = userList.find(user => user.id === sessionData?.user.id)?.isAdmin;

  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (sessionData?.user?.id) {
        try {
          const responses = await Promise.all([
            fetch(`/api/viewPendingRequests?userId=${sessionData.user.id}`),
            fetch(`/api/viewFriendRequests?userId=${sessionData.user.id}`)
          ]);
          const [sentRequests, receivedRequests] = await Promise.all(responses.map(res => res.json()));

          const updatedUserList = initialUserList.map(user => ({
            ...user,
            requestPending: sentRequests.some(req => req.receiverId === user.id),
            isRequestReceived: receivedRequests.some(req => req.senderId === user.id)
          }));
          setUserList(updatedUserList);
          setFilteredUserList(updatedUserList);
        } catch (error) {
          console.error('Failed to fetch friend requests:', error);
        }
      }
    };
    const fetchMyFriendships = async () => {
      if (sessionData?.user?.id) {
        try {
          const response = await fetch(`/api/findMyFriendships?userId=${sessionData.user.id}`);
          if (!response.ok) {
            console.log('Failed to fetch friendships');
          }
          const friendships = await response.json(); // This should return an array of friendship objects
    
          // Update user list with friendship status
          const friendIds = friendships.reduce((acc, friendship) => {
            // Add both userId and friendId to the list of friend IDs, excluding the current user's ID
            if (friendship.userId !== sessionData.user.id) {
              acc.push(friendship.userId);
            }
            if (friendship.friendId !== sessionData.user.id) {
              acc.push(friendship.friendId);
            }
            return acc;
          }, []);
    
          const updatedUserList = initialUserList.map(user => ({
            ...user,
            isFriend: friendIds.includes(user.id) // Set isFriend true if user.id is in friendIds
          }));
          
          setUserList(updatedUserList);
          setFilteredUserList(updatedUserList);
        } catch (error) {
          console.error('Failed to fetch friendships:', error);
        }
      }
    };
    fetchFriendRequests();
    fetchMyFriendships();
  }, [initialUserList, sessionData]);

  const handleSearch = (searchTerm: string) => {
    const lowercasedTerm = searchTerm.toLowerCase();
    setFilteredUserList(
      userList.filter(user => user.name.toLowerCase().includes(lowercasedTerm))
    );
  };

  return (
    <div>
      <h1 className='text-white font-mono font-semibold text-xl'>User List</h1>
      <SearchBar onSearch={handleSearch} /> 
      <ul className='text-white font-mono mb-5 text-lg bg-gray-500 p-1 rounded-xl shadow-xl max-h-80 overflow-y-auto'>
        {filteredUserList.map(user => (
          <div className='flex items-center m-8' key={user.id}>
            <li className='flex-1'>
              {user.name}
            </li>
            {isLoggedInUserAdmin && user.isAdmin !== true && (
              <button
                className='ml-2 border px-8 bg-white text-black rounded-xl font-mono font-semibold hover:bg-gray-300 hover:text-red-500'
                onClick={() => onDeleteUser(user.id)}>
                Delete
              </button>
            )}
          </div>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
