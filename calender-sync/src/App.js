import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtV-bQpto6icFc-Ag2QJ5ynMResZIdjmw",
  authDomain: "calendar-697d4.firebaseapp.com",
  databaseURL: "https://calendar-697d4-default-rtdb.firebaseio.com",
  projectId: "calendar-697d4",
  storageBucket: "calendar-697d4.firebasestorage.app",
  messagingSenderId: "786013806432",
  appId: "1:786013806432:web:7a7bf5830922d1d4d88805",
  measurementId: "G-V2CKGQ4MB4"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

function CalendarApp() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ summary: '', start: '', end: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const eventList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventList);
    });

    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleInputChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleAddEvent = async () => {
    if (!user) return; // Only allow adding events when signed in.
    try {
      await addDoc(collection(db, "events"), {
        ...newEvent,
        uid: user.uid, // Store user ID with the event
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
      });
      setNewEvent({ summary: '', start: '', end: '' }); // Clear input fields
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

    const handleDeleteEvent = async (id) => {
      if(!user) return;
        try {
            const eventDoc = doc(db, "events", id);
            const eventData = events.find(event => event.id === id);
            if(eventData && eventData.uid === user.uid){
                await deleteDoc(eventDoc);
            } else {
              console.error("You are not authorized to delete this event.");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const handleUpdateEvent = async (id, updatedEvent) => {
      if(!user) return;
        try {
            const eventDoc = doc(db, "events", id);
            const eventData = events.find(event => event.id === id);
            if(eventData && eventData.uid === user.uid){
                await updateDoc(eventDoc, updatedEvent);
            } else {
              console.error("You are not authorized to update this event.");
            }
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}!</p>
          <button onClick={handleSignOut}>Sign Out</button>
          <div>
            <input type="text" name="summary" placeholder="Summary" value={newEvent.summary} onChange={handleInputChange} />
            <input type="datetime-local" name="start" value={newEvent.start} onChange={handleInputChange} />
            <input type="datetime-local" name="end" value={newEvent.end} onChange={handleInputChange} />
            <button onClick={handleAddEvent}>Add Event</button>
          </div>
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                {event.summary} - {event.start?.toDate().toLocaleString()} to {event.end?.toDate().toLocaleString()}
                <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
                <button onClick={() => handleUpdateEvent(event.id, {summary: "Updated event"})}>Update</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button onClick={handleSignIn}>Sign In with Google</button>
      )}
    </div>
  );
}

export default CalendarApp;
