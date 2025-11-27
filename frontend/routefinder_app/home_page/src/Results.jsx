import React, { useState} from 'react';
import axios from 'axios';


const isValidateText = (value) => {
      const regex = /^[A-Za-z]+$/; // only English letters
  return regex.test(value);
};
  
  // RouteCard
  // A function that takes data about the trip (I forgot what data we were using but this is easily expanded)
  // returns a card containing all that data formatted horizontally
  // I only return a a string of vehicleType rn because idk what images were putting here

const RouteCard = ({ companyLogo, company, cost, time, layovers, showRoutes }) => {
    const [expanded, setExpanded] = useState(false);
    const Chevron = expanded ? "▲" : "▼";

    const hours = Math.floor(time / 60);
    const minutes = time % 60;

    const classes = `route fade-in border border-gray-300 rounded-xl p-5 mb-4 bg-white shadow-sm hover:shadow-md transition-all w-full ${showRoutes ? "show" : ""}`;


  return (
    <div className={classes}>
        <div className="grid grid-cols-[200px_150px_150px_120px_40px] gap-4 items-center">
            {/* Airline Info */}
            <div className="companyName flex items-center gap-3 min-w-[180px]">
                <img src={companyLogo} alt={company} className="w-8 h-8 object-contain"/>
                <p>{company}</p>
            </div>
            {/* Duration */}
            <div className="flex flex-col items-center min-w-[140px]">
                <div className="text-xs text-gray-500 mb-1">Duration</div>
                <div className="font-medium text-gray-700">
                    {time % 60 !== 0 ? (
                        <p className="font-medium">{parseInt(hours)} hours and {minutes} minutes</p>
                    ) : (
                        <p className="font-medium">{parseInt(hours)} hours</p>
                    )}
                </div>
            </div>

            {/* Layovers */}
            <div className="flex flex-col items-center min-w-[140px]">
                <div className="text-xs text-gray-500 mb-1">Stops</div>
                <div className="font-medium text-gray-800"></div>
                {layovers.length > 0 ? (
                <>
                {(() => {
                    const layover_ids = layovers.slice(0, -1).map(l => l.arrival_id);
                    return (
                    <>
                        <p>Layovers: ({layover_ids.join(", ")})</p>
                    </>
                    );
                })()}
                </>
            ) : (
                <p>Direct</p>
            )}

            </div>

            {/* Price */}
            <div className="flex flex-col items-end min-w-[120px]">
                <div className="text-xs text-gray-500 mb-1">Price</div>
                <div className="text-2xl font-bold text-blue-600">${cost}</div>
            </div>

            {/* Expand button */}
            {layovers.length > 1 && (
            <button 
                onClick={() => setExpanded(!expanded)} 
                className="ml-2 text-2xl text-gray-400 hover:text-gray-600 transition-colors w-8">
            {Chevron}
            </button>
            )}
        </div>


        {/*/!* Dropdown section *!/*/}
          {expanded && (
            <div className="mt-3 p-3 bg-gray-100 rounded-lg text-left w-full">
              <p className="font-semibold mb-2">Trip Details:</p>
              <ul className="list-disc ml-5">
                <li>Flight 1: Departure from {layovers[0].departure_id} → {layovers[0].arrival_id}</li>
                      {(() => {
                        const layover_segments = [];
                        //Layover time segment
                        for (let i = 1; i < layovers.length; i++) {
                          if (i !== layovers.length) {
                            const arrival_time = layovers[i-1].arrival_time;
                            const departure_time = layovers[i ].departure_time;
                            const [arrival_hours, arrival_minutes] = arrival_time.split(':').map(Number);
                            console.log(arrival_hours, arrival_minutes)
                            const [departure_hours, departure_minutes] = departure_time.split(':').map(Number);
                            console.log(departure_hours, departure_minutes)
                            const total_time = Math.abs((arrival_hours * 60 + arrival_minutes) -(departure_hours * 60 + departure_minutes));
                            console.log('totaltime;',total_time)
                            if (total_time % 60 !== 0) {
                              layover_segments.push(
                                <li key={`time-${i}`}>
                                  Layover time: {parseInt(total_time / 60)} hours and {total_time % 60} minutes
                                </li>
                              );
                            } else {
                              layover_segments.push(
                                <li key={`time-${i}`}>
                                  Layover time: {parseInt(total_time / 60)} hours
                                </li>
                              );
                            }
                          }
                          //Flight Segment
                          layover_segments.push(
                            <li key={`seg-${i}`}>
                              Flight {i+1}: {layovers[i - 1].arrival_id} → {layovers[i].arrival_id}
                            </li>
                          );


                        }
                        return layover_segments;
                      })()}

              </ul>
            </div>
          )}

      </div>
    );
  };

// Component to display results
export function FlightResults({ routes, showRoutes, loading }) {
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 text-center">
        <p className="text-xl text-gray-600">Searching for flights...</p>
      </div>
    );
  }

  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">Available Routes</h2>
      <div className="routes flex flex-col gap-3">
        {routes.map((route, idx) => (
          <RouteCard key={idx} {...route} showRoutes={showRoutes} />
        ))}
      </div>
    </div>
  );
}

// Function to perform search
export async function FlightSearch({ from, to, tripType, departDate, returnDate, cabinClass }) {
  // Extract airport codes from formatted strings like "New York (JFK)"
  const extractCode = (text) => {
    const match = text.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : text.toUpperCase();
  };

  const origin = extractCode(from);
  const destination = extractCode(to);

  if (!isValidateText(origin)) {
    throw new Error('Your origin airport should only be letters. For example: "IAD" or "SFO"');
  }
  if (!isValidateText(destination)) {
    throw new Error('Your destination airport should only be letters. For example: "IAD" or "SFO"');
  }

  if (!origin || !destination) {
    throw new Error("Please enter both origin and destination airports.");
  }

  if (!departDate) {
    throw new Error("Please select a departure date.");
  }

  const roundTrip = tripType === 'roundtrip' ? 1 : 2;

  const response = await axios.get('https://routefinder.api.lukeholmes.dev/flights/search/', {
    params: {
      departure_id: origin,
      arrival_id: destination,
      hl: "en",
      outbound_date: departDate,
      return_date: returnDate || departDate,
      currency: "USD",
      format: "json",
      type: roundTrip
    }
  });

  console.log('Raw response:', response.data);
  const responses = response.data;

  if (!responses || !responses.outbound_trips) {
    throw new Error("Invalid response from server");
  }

  console.log('Number of trips:', responses.outbound_trips.length);

  const routes = [];

  for (let i = 0; i < responses.outbound_trips.length; i++) {
    const trip = responses.outbound_trips[i];

    if (trip.price === null) continue;

    let total_time = 0;
    let layovers = [];

    if (trip.flights.length > 1) {
      for (let j = 0; j < trip.flights.length; j++) {
        total_time += trip.flights[j].duration;
        layovers.push(trip.flights[j]);
      }
    } else {
      total_time = trip.flights[0].duration;
    }

    routes.push({
      id: i,
      companyLogo: trip.flights[0].airline_logo,
      time: total_time,
      company: trip.flights[0].airline_name,
      cost: trip.price,
      layovers: layovers
    });
  }

  return routes;
}