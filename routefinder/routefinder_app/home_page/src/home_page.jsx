import React, { useState } from "react";

export default function AirportRoutes() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);

  // Dummy data for now
  const dummyRoutes = [
    { id: 1, route: "Flight 101: Direct from JFK to LAX" },
    { id: 2, route: "Flight 202: Layover in ORD" },
    { id: 3, route: "Flight 303: Layover in DFW" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pretend theres an API response here
    if (origin && destination) {
      setRoutes(dummyRoutes);
    } else {
      alert("Please enter both origin and destination airports.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-gray-800 p-4">
      <h1 className="text-3xl font-bold mb-4">Airport Route Finder</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white p-6 rounded-2xl shadow-lg">
        <input
          type="text"
          placeholder="Origin Airport (e.g. JFK)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="border rounded-lg p-2 w-64"
        />
        <input
          type="text"
          placeholder="Destination Airport (e.g. LAX)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border rounded-lg p-2 w-64"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Find Routes
        </button>
      </form>

      <div className="mt-6 w-full max-w-md">
        {routes.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Available Routes:</h2>
            <ul className="list-disc pl-6">
              {routes.map((r) => (
                <li key={r.id}>{r.route}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
