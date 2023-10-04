// src/App.js
import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const socket = socketIOClient("http://localhost:4000");

function App() {
  const [list, setList] = useState([]);

  useEffect(() => {
    // Listen for the cryptoPrices event and update cryptocurrency prices
    socket.on("cryptoPrices", (prices) => {
      console.log("Fetching new prices");
      setList((list) => [prices, ...list]);
    });

    return () => {
      socket.off("cryptoPrices");
    };
  }, []);

  return (
    <div className="App">
      <h1>Crypto Price Tracker</h1>
      <h3>
        Latest BTC Price: $
        {list[0] > 0 && list[0] !== "NA" ? list[0].toFixed(2) : list[0]}
      </h3>
      {list?.slice(1)?.map((item, i) => (
        <p key={i}>${item > 0 && item !== "NA" ? item.toFixed(2) : item}</p>
      ))}
    </div>
  );
}

export default App;
