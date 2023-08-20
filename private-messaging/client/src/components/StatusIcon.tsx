import React from "react";

interface StatusIconProps {
  connected: boolean;
}

const StatusIcon: React.FC<StatusIconProps> = ({ connected }) => {
  return (
    <i
      className={`icon ${connected ? "connected" : ""}`}
      style={{
        height: "8px",
        width: "8px",
        borderRadius: "50%",
        display: "inline-block",
        backgroundColor: connected ? "#86bb71" : "#e38968",
        marginRight: "6px",
      }}
    />
  );
};

export default StatusIcon;
