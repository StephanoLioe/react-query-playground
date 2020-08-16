import React from 'react';
import { useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query-devtools'
import './App.css';

interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;

}

const url = "https://reqres.in/api/users/"

const fetchUsers = async () => {
  const res = await fetch(url)
  return res.json()
}

function App() {
  const { data, status } = useQuery('getUsers', fetchUsers)
  console.log(data, status)

  return (
    <>
    <ReactQueryDevtools initialIsOpen />
    <div className="App">
      <h1>Users</h1>

      { status === 'loading' && (
        <div>Loading users...</div>
      )}

      { status === 'error' && (
        <div>Error fetching the users</div>
      )}

      { status === 'success' && (
        <div>
          { data.data.map((user: IUser) => 
            <div key={user.id}>{user.first_name} {user.last_name}</div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

export default App;
