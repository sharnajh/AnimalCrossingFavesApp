import React from "react";
import "./styles.scss";
import axios from "axios";

const { useEffect, useState } = React;

const url = "https://acnhapi.com/v1/villagers/";

const Heart = ({ handleFave, villager }) => {
  return (
    <svg
      onClick={() => handleFave(villager.id)}
      id="heart"
      viewBox="0 -28 512.00002 512"
      fill={villager.favorite ? "hotpink" : "lightgray"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m471.382812 44.578125c-26.503906-28.746094-62.871093-44.578125-102.410156-44.578125-29.554687 0-56.621094 9.34375-80.449218 27.769531-12.023438 9.300781-22.917969 20.679688-32.523438 33.960938-9.601562-13.277344-20.5-24.660157-32.527344-33.960938-23.824218-18.425781-50.890625-27.769531-80.445312-27.769531-39.539063 0-75.910156 15.832031-102.414063 44.578125-26.1875 28.410156-40.613281 67.222656-40.613281 109.292969 0 43.300781 16.136719 82.9375 50.78125 124.742187 30.992188 37.394531 75.535156 75.355469 127.117188 119.3125 17.613281 15.011719 37.578124 32.027344 58.308593 50.152344 5.476563 4.796875 12.503907 7.4375 19.792969 7.4375 7.285156 0 14.316406-2.640625 19.785156-7.429687 20.730469-18.128907 40.707032-35.152344 58.328125-50.171876 51.574219-43.949218 96.117188-81.90625 127.109375-119.304687 34.644532-41.800781 50.777344-81.4375 50.777344-124.742187 0-42.066407-14.425781-80.878907-40.617188-109.289063zm0 0" />
    </svg>
  );
};

const Button = ({ fetchVillager, isLoading, blurOut, data }) => {
  const newId = () => {
    const id = Math.floor(Math.random() * 391) + 1;
    data.some((villager) => villager.id === id) ? newId() : fetchVillager(id);
  };
  const handleClick = async () => {
    await blurOut(false);
    newId();
  };
  return (
    <button onClick={handleClick} disable={isLoading && data.length >= 391}>
      New Villager
    </button>
  );
};

const Info = ({
  villager,
  fetchVillager,
  isLoading,
  villagerData,
  handleFave
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <div id="wrapper">
      <h1>
        {villager.name["name-USen"]}
        <Heart handleFave={handleFave} villager={villager} />
      </h1>
      <div id="portrait">
        <img
          alt="portrait"
          src={villager["image_uri"]}
          id="portrait"
          style={{ filter: imgLoaded ? "blur(0px)" : "blur(20px)" }}
          onLoad={() => setImgLoaded(true)}
        />
      </div>
      <div id="data">
        <div className="label">Personality:</div>
        <p className="info">{villager.personality}</p>
        <div className="label">Birthday:</div>
        <p className="info">{villager["birthday-string"]}</p>
        <div className="label">Species:</div>
        <p className="info">{villager.species}</p>
        <div className="label">Catch Phrase:</div>
        <p className="info">"{villager["catch-phrase"]}"</p>
      </div>
      <Button
        fetchVillager={fetchVillager}
        isLoading={isLoading}
        blurOut={setImgLoaded}
        data={villagerData}
      />
    </div>
  );
};

const SectionItem = ({ villager, setID, handleFave }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <li id="villager-item" onClick={() => setID(villager.id)}>
      <div className="info">
        <img
          alt="icon"
          src={villager["icon_uri"]}
          className="icon"
          style={{ opacity: loaded ? "1" : "0" }}
          onLoad={() => setLoaded(true)}
        />
        <div className="name">{villager.name["name-USen"]}</div>
        <div className="heart">
          <Heart villager={villager} handleFave={handleFave} />
        </div>
      </div>
    </li>
  );
};

const Section = ({ data, setID, handleFave }) => (
  <ul>
    {data.map((villager) => (
      <SectionItem
        key={villager.id}
        villager={villager}
        setID={setID}
        handleFave={handleFave}
      />
    ))}
  </ul>
);

const Sidebar = ({ data, setID, handleFave }) => {
  const [display, toggle] = useState(false);
  return (
    <div id="sidebar">
      <nav>
        <div
          className="tab"
          onClick={() => toggle(false)}
          style={{ color: display ? "gray" : "coral" }}
        >
          History
        </div>
        <div
          className="tab"
          onClick={() => toggle(true)}
          style={{ color: display ? "coral" : "gray" }}
        >
          Faves
        </div>
        <div
          id="tabber"
          style={{ left: !display ? 0 : "45%", right: !display ? "45%" : 0 }}
        />
      </nav>
      {display ? (
        <Section
          data={data.filter((v) => v.favorite)}
          setID={setID}
          handleFave={handleFave}
        />
      ) : (
        <Section data={data} setID={setID} handleFave={handleFave} />
      )}
    </div>
  );
};

const App = () => {
  const [id, setID] = useState(221);
  const [villager, setVillager] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, toggleError] = useState(null);
  const [villagerData, addVillager] = useState([]);

  const handleFave = (vid) => {
    addVillager(
      villagerData.map((v) => {
        if (v.id === vid) return { ...v, favorite: !v.favorite };
        return v;
      })
    );
  };

  const fetchVillager = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(url + id);
      const data = { ...res.data, favorite: false };
      addVillager((prev) => [...prev, data]);
      setID(id);
      setLoading(false);
    } catch (err) {
      console.log("Error: " + err);
      toggleError(err.toString());
    }
  };

  useEffect(() => {
    fetchVillager(id);
  }, [setLoading, addVillager, id]);

  useEffect(() => {
    const current = villagerData.find((v) => v.id === id);
    setVillager(current);
  }, [villagerData, setVillager, id]);
  return (
    <div>
      {villager ? (
        <div>
          <Info
            villager={villager}
            fetchVillager={fetchVillager}
            isLoading={isLoading}
            villagerData={villagerData}
            handleFave={handleFave}
          />
          <Sidebar data={villagerData} setID={setID} handleFave={handleFave} />
        </div>
      ) : (
        <h1 style={{ backgroundColor: "white", padding: 10, borderRadius: 10 }}>
          {!error ? "Loading..." : error}
        </h1>
      )}
    </div>
  );
};

export default App;
