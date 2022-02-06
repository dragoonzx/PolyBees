import React from "react";
import tweet from "../assets/tweet.png";
import { NavLink } from "react-router-dom";

const QuickStart = () => {
  return (
    <div className="w-full flex justify-between">
      <div>
        <h1 className="text-8xl">PolyBees</h1>
        <p className="text-2xl text-primary-content max-w-sm mt-4">
          Trustless peer-to-peer web3 escrow service for web2 influencer
          marketing
        </p>
        <NavLink to="/beesapp">
          <button className="btn btn btn-primary mt-4">Explore</button>
        </NavLink>
      </div>
      <div className="drop-shadow-2xl mr-4">
        <img
          src={tweet}
          alt=""
          className="rounded-lg drop-shadow-2xl h-2/3"
          style={{ filter: "var(--tw-drop-shadow)" }}
        />
        <p className="text-sm font-light italic mt-2 text-primary-content">
          Example of influencer post on Twitter through PolyBees platform
        </p>
      </div>
    </div>
  );
};

export default QuickStart;
