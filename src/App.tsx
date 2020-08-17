import React from 'react';
import { useQuery, useMutation, queryCache } from 'react-query'
import { ReactQueryDevtools } from 'react-query-devtools'
import './App.css';

interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
  fetched?: boolean;

}

const url = "https://reqres.in/api/users/"

const fetchUsers = async () => {
  const res = await fetch(url)
  return res.json()
}

const updateUser = async (newUser: IUser ) => {
  const updateUrl = `${url}${newUser.id}?delay=3`
  const res = await fetch(updateUrl, {
    method: "PUT",
    headers: {"Content-type": "application/json"},
    body: JSON.stringify({ ...newUser})
  })
  return await res.json()
}

const F_CHANGED = "IRON" 
const L_CHANGED = "MAN"

function App() {
  const { data , status } = useQuery('users', fetchUsers)
  console.log(data, status)

  const [ mutate ] = useMutation(updateUser, {
    onSuccess: (fetchedNewUser: IUser) => {
      queryCache.setQueryData("users", (prev: any) => {
        const arr = prev.data.filter( (u: IUser ) => u.id !== fetchedNewUser.id)
        return {...prev, data: [...arr, {...fetchedNewUser, fetched: true}]}
      }) 
    },

    onMutate: (newUser: IUser) => {
      queryCache.cancelQueries("users")

      const snapshot = queryCache.getQueryData("users")

      queryCache.setQueryData("users", (prev: any) => {
        const arr = prev.data.filter( (u: IUser ) => u.id !== newUser.id)
        return {...prev, data: [...arr, newUser]}
      })
      return () => queryCache.setQueryData("users", snapshot)
    },
    onError: (error, newUser, rollback) => rollback()
   
  })  

  const userToUpdate = status === "success" ? data?.data.filter((u: IUser) => u.id === 2)[0] : undefined
  const updateInProgress = userToUpdate && userToUpdate.first_name !== F_CHANGED

  return (
    <>
    <ReactQueryDevtools initialIsOpen />
    <div className="App">
      <h1>Users</h1>
      <h2>Updating a user with optimistic ui update</h2>

      { status === 'loading' && (
        <div>Loading users...</div>
      )}

      { status === 'error' && (
        <div>Error fetching the users</div>
      )}

      { status === 'success' && (
        <div>
          { data.data.sort((a: IUser, b: IUser ) => a.id - b.id).map((user: IUser) => 
            <div key={user.id}>{user.first_name} {user.last_name} {user.id === 2 && <span>&#x2B05;</span>} {user.fetched ? <span style={{backgroundColor: "green", color: "#fff", padding: 5}}>fetched</span> : ""}</div>
          )}
          <br />
          { updateInProgress ? 
            <button 
              onClick={() => mutate({...userToUpdate, first_name: F_CHANGED, last_name: L_CHANGED})}>
              Update {userToUpdate.first_name} {userToUpdate.last_name} to 
              {' '}
          <span style={{color: "red"}}>{F_CHANGED} {L_CHANGED}</span>
            </button> 
            : 
            <h2>Fetch delay is 3 seconds</h2>}
        </div>
      )}
    </div>
    </>
  );
}

export default App; 
