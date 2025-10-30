//imports

import React, { useState } from "react";
import { Plane, TrainTrack, Rat, Redo, Split } from "lucide-react";


export default function AirportRoutes() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [showRoutes, setShowRoutes] = useState(false);

  // Dummy route data. just call the function with the data we get from the api
  const dummyRoutes = [
    { id: 1, vehicleType: "Plane", company: "Delta Airlines", cost: "$350", layovers: ["ORD"] },
    { id: 2, vehicleType: "Plane", company: "United Airlines", cost: "$420", layovers: ["DFW", "DEN"] },
    { id: 2, vehicleType: "Train", company: "Amtrak", cost: "$6969696", layovers: [""] },
    { id: 3, vehicleType: "Your mother", company: "this took to fucking long", cost: "$10000000000000000", layovers: ["hell"] },
  ];

  // error handling on blank input
  const handleSubmit = (e) => {
    e.preventDefault();
    if (origin && destination){
      setShowRoutes(true);
      setRoutes(dummyRoutes);
    }
    else alert("Please enter both origin and destination airports.");
  };


  {/* RouteCard
  A function that takes data about the trip (I forgot what data we were using but this is easily expanded)
  returns a card containing all that data formatted horizontally
  I only return a a string of vehicleType rn because idk what images were putting here  */}

  const RouteCard = ({ vehicleType, company, cost, layovers }) => {
  let IconComponent;

  // Pick which icon to use
  switch (vehicleType.toLowerCase()) {
    case "plane":
      IconComponent = Plane;
      break;
    case "train":
      IconComponent = TrainTrack;
      break;
    default:
      IconComponent = Rat; // fallback icon
      break;
  }

  const classes = `route fade-in flex justify-center border border-gray-200 rounded-xl p-4 mb-3 bg-white shadow hover:shadow-md transition w-full max-w-3xl ${showRoutes ? "show" : ""}`;

  return (
    <div className={classes} >
      {/*<p className="text-gray-800 text-base flex items-center gap-2">*/}
      <div className="companyName font-semibold text-blue-700">
        <IconComponent className="w-5 h-5 text-gray-600" /><p>{company}</p>
        </div>
        <p className="font-medium">Cost = {cost}</p>
      <p>Layovers:{" "}</p>
        {layovers.length > 0 ? (
          <p>[{layovers.join(", ")}]</p>
        ) : (
          <p>Direct</p>
        )}
      {/*</p>*/}
    </div>
  );
};

{/* Da meat */}
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50 text-gray-800 p-6">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold mb-6">Airport Route Finder</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-lg mb-8 w-full"
        >
          <input
            type="text"
            placeholder="Origin Airport (e.g. JFK)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="border rounded-lg p-2 w-64 text-center"
          />

          <Redo></Redo>

          <input
            type="text"
            placeholder="Destination Airport (e.g. LAX)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border rounded-lg p-2 w-64 text-center"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition w-64"
          >
            Find Routes
          </button>
        </form>

        {routes.length > 0 && (
          <div className="flex flex-col items-center mt-8 w-full">
            <h2 className="text-xl font-semibold mb-4">Available Routes:</h2>
            <div className="routes">
            {routes.map((route) => (
              <RouteCard key={route.id} {...route} />
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
