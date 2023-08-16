import { useEffect, useState } from "react";

import { io } from "socket.io-client";

type Candidate = {
  id: number;
  name: string;
  votes: number;
};

type Candidates = Candidate[];

const socket = io("http://localhost:3001");

function App() {
  const [candidates, setCandidates] = useState<Candidates>([]);

  useEffect(() => {
    socket.on("candidates", (candidates: Candidates) => {
      setCandidates(candidates);
      console.log(candidates);
    });

    return () => {
      socket.off("candidates");
    };
  }, []);

  const handleVote = (candidateId: number) => {
    socket.emit("vote", candidateId);
  };

  return (
    <>
      <div className="h-screen w-screen flex items-center justify-center flex-row gap-10">
        {candidates.map((c: Candidate) => (
          <div key={c.id} className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{c.name}</div>
              <div className="text-2xl font-bold">{c.votes}</div>
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleVote(c.id)}
            >
              Vote
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
