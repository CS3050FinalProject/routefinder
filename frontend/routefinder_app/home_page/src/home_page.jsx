//imports

import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Plane, TrainFront, Rat, Redo, BusFront } from "lucide-react";
import { ReactComponent as RoutefinderLogo } from './images/Logo.svg';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {FormGroup} from "react-bootstrap";


  const isValidateText = (value) => {
      const regex = /^[A-Za-z]+$/; // only English letters
      const isValid = regex.test(value);

      return isValid;
};





  function DirectSwitch() {
  return (
      <Form.Check
        type="switch"
        id="RoundTripSwitch"
        label="Round Trip?"
      />
  );
}

function TravelClassSelect() {
  return (
      <FormGroup>
        <FloatingLabel controlId="floatingSelect" label="Travel Class Selection">
          <Form.Select aria-label="Travel Class Selections" >
            <option value="1">Economy</option>
            <option value="2">Business</option>
            <option value="3">First Class</option>
          </Form.Select>
        </FloatingLabel>
      </FormGroup>
  );
}


const DateRangeWithPortal = () => {
    // keep dateRange as a stateful array [startDate, endDate]
    const current = new Date();
    const date = `${current.getMonth()+1}/${current.getDate()}/${current.getFullYear()}`;
    const next_date = `${current.getMonth()+1}/${current.getDate()+1}/${current.getFullYear()}`;
    const [dateRange, setDateRange] = useState([date, next_date]);
    const [startDate, endDate] = dateRange;

    return (
      <DatePicker
        selected={startDate}
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => {
          setDateRange(update);
        }}
        selectsRange
        withPortal
        placeholderText="Select date range"
      />
    );
  };

  function Form_Grid({ origin, setOrigin, destination, setDestination, handleSubmit }) {
  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col>
          <input
            type="text"
            placeholder="Origin Airport (e.g. JFK)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="border rounded-lg p-2 w-64 text-center"
          />
        </Col>
        <Col className="flex items-center justify-center">
          <Redo />
        </Col>
        <Col>
          <input
            type="text"
            placeholder="Destination Airport (e.g. LAX)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border rounded-lg p-2 w-64 text-center"
          />
        </Col>
        <Col>
          <Button variant="primary" type="submit">
            Find Routes
          </Button>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <DateRangeWithPortal />
        </Col>
        <Col>
          <TravelClassSelect />
        </Col>
        <Col>
          <DirectSwitch />
        </Col>
      </Row>
    </Form>
  );
  }

  {/* RouteCard
  A function that takes data about the trip (I forgot what data we were using but this is easily expanded)
  returns a card containing all that data formatted horizontally
  I only return a a string of vehicleType rn because idk what images were putting here  */}

  const RouteCard = ({ vehicleType, company, cost, layovers, showRoutes }) => {
  let IconComponent;

  // Pick which icon to use
  switch (vehicleType.toLowerCase()) {
    case "plane":
      IconComponent = Plane;
      break;
    case "train":
      IconComponent = TrainFront;
      break;
    case "bus":
      IconComponent = BusFront;
      break;
    default:
      IconComponent = Rat; // fallback icon
      break;
  }

  const classes = `route fade-in flex justify-center border border-gray-200 rounded-xl p-4 mb-3 bg-white shadow hover:shadow-md transition w-full max-w-3xl ${showRoutes ? "show" : ""}`;

  return (
    <div className={classes} >
      <div className="companyName font-semibold text-blue-700">
        <IconComponent className="w-5 h-5 text-gray-600" /><p>{company}</p>
        </div>
        <p className="font-medium">Cost = ${cost}</p>
        {layovers.length > 0 ? (
        <p>Layovers: ({layovers.join(", ")})</p>
        ) : (
        <p>Direct</p>
        )}
    </div>
  );
};

  export default function AirportRoutes() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [showRoutes, setShowRoutes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [responsePreview, setResponsePreview] = useState(null);




  // Dummy route data. just call the function with the data we get from the api
  const dummyRoutes = [
    {id: 1, vehicleType: "Plane", company: "Delta Airlines", cost: "350", layovers: ["ORD"]},
    {id: 2, vehicleType: "Plane", company: "United Airlines", cost: "420", layovers: ["DFW", "DEN"]},
    {id: 3, vehicleType: "Train", company: "Amtrak", cost: "6969696", layovers: []},
    {id: 4, vehicleType: "Bus", company: "GreyHound", cost: "25", layovers: ["JFK"] },
    { id: 5, vehicleType: "Plane", company: "Ryanair", cost: "50", layovers: ["DFW", "DEN", "KAS", 'JFK'] },
    { id: 6, vehicleType: "Train", company: "BNSF Railway", cost: "3043", layovers: ["KAS", 'JFK'] },
    { id: 7, vehicleType: "Train", company: "Union Pacific", cost: "291", layovers: ["KSF", 'PEO'] },
    { id: 8, vehicleType: "Train", company: "Norfolk Southern", cost: "48", layovers: [] },
    { id: 9, vehicleType: "Bus", company: "GMT", cost: "38", layovers: [] },
    { id: 10, vehicleType: "buss", company: "fake company 1", cost: "23", layovers: ["helLA"] },
    { id: 11, vehicleType: "ahbfa", company: "fake company 2", cost: "232", layovers: ["hell"] },
  ];


// Updated handleSubmit that uses getTestJson
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!origin || !destination) {
    alert("Please enter both origin and destination airports.");
    return;
  }

  const endpoint = "https://routefinder-api-env-prod.eba-egdm2f3j.us-east-1.elasticbeanstalk.com/flights/search/";

  setLoading(true);
  setError(null);
  setResponsePreview(null);

  try {
    const params = {
    departure_id: "PEK",
    arrival_id: "AUS",
    // "gl": "us",
    hl: "en",
    // "type": 1,
    outbound_date: "2025-11-14",
    return_date: "2025-11-16",
    // "travel_class": 1,
    // "exclude_basic": false,
    currency: "USD",
    // "deep_search": false
    };

    const url = new URL(endpoint);
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

    console.log("Fetching:", url.toString());

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
      },
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    console.log("API response:", data);
    setResponsePreview(
      typeof data === "string"
        ? data.slice(0, 500)
        : JSON.stringify(data, null, 2)
    );

    //should map it to a Route
    if (data && Array.isArray(data.results)) {
      const mappedRoutes = data.results.map((r, idx) => ({
        id: r.id ?? idx,
        vehicleType: r.transport ?? "plane",
        company: r.carrier_name ?? r.operator ?? "Unknown",
        cost: r.price ?? r.fare ?? "N/A",
        layovers: Array.isArray(r.stops) ? r.stops : [],
      }));
      setRoutes(mappedRoutes);
      setShowRoutes(true);
    } else {
      console.warn("No valid results array, showing dummy routes instead");
      setRoutes(dummyRoutes);
      setShowRoutes(true);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    setError(err.message || "Unknown error occurred");
  } finally {
    setLoading(false);
  }
};



{/* Da meat */}
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50 text-gray-800 p-6">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        <header className={""}>
          <a href={'http://localhost:3000'}>
            <RoutefinderLogo width={200} height={200} className="mt-4"/>
          </a>
           <Form_Grid
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
            handleSubmit={handleSubmit}
          />


        </header>

        {loading && <p>Loading…</p>}

        {error && <p className="text-red-600">Error: {error}</p>}

        {responsePreview && (
          <pre className="bg-gray-100 p-3 rounded text-left overflow-auto whitespace-pre-wrap max-h-80">
            {responsePreview}
          </pre>
        )}

        {routes.length > 0 && (
            <div className="flex flex-col items-center mt-8 w-full">
              <h2 className="text-xl font-semibold mb-4">Available Routes:</h2>
              <div className="routes">
                {routes.map((route) => (
                    <RouteCard key={route.id} {...route} showRoutes={showRoutes}/>
                ))}
              </div>
            </div>
        )}
      </div>
    </div>
  );
}




