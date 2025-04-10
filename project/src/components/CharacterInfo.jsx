import React from "react";
import characterStats from "../config/characterStats";

const CharacterInfo = ({ character }) => {
  const stats = characterStats[character] || {};

  return (
    <div className="character-stats">
      <h3>{character}</h3>
      <div className="stat-row">
        <span>Dégâts:</span>
        <div className="stat-bar">
          <div
            className="stat-fill"
            style={{ width: `${stats.degats * 5}%` }}
          ></div>
        </div>
        <span>{stats.degats}</span>
      </div>
      <div className="stat-row">
        <span>Défense:</span>
        <div className="stat-bar">
          <div
            className="stat-fill"
            style={{ width: `${stats.defense * 5}%` }}
          ></div>
        </div>
        <span>{stats.defense}</span>
      </div>
      <div className="stat-row">
        <span>Vitesse:</span>
        <div className="stat-bar">
          <div
            className="stat-fill"
            style={{ width: `${stats.vitesse * 5}%` }}
          ></div>
        </div>
        <span>{stats.vitesse}</span>
      </div>
      <p className="special">Spécial: {stats.special}</p>
      <p className="description">{stats.description}</p>
    </div>
  );
};

export default CharacterInfo;
