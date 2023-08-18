import React, { useState } from "react";

interface SelectUsernameProps {
  onInput: (username: string) => void;
}

const SelectUsername: React.FC<SelectUsernameProps> = ({ onInput }) => {
  const [username, setUsername] = useState("");

  const isValid = username.length > 2;

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isValid) {
      onInput(username);
    }
  };

  return (
    <div className="select-username w-64 mx-auto mt-40">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username..."
          className="border rounded p-2 w-full"
        />
        <button
          type="submit"
          disabled={!isValid}
          className="bg-blue-500 text-white px-4 py-2 mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default SelectUsername;
