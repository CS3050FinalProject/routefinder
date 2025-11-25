//imports

import React, {useState} from "react";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import {BusFront, Plane, Rat, Redo, TrainFront} from "lucide-react";
import {ReactComponent as RoutefinderLogo} from './images/Logo.svg';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {FormGroup} from "react-bootstrap";


const isValidateText = (value) => {
      const regex = /^[A-Za-z]+$/; // only English letters
  return regex.test(value);
};





  function DirectSwitch({ roundTrip, setRoundTrip }) {
  const handleChange = (e) => {
    setRoundTrip(e.target.checked ? 1 : 2);
  };

  return (
    <Form.Check
      type="switch"
      name="RoundTripSwitch"
      id="RoundTripSwitch"
      label="Round Trip?"
      checked={roundTrip === 1}
      onChange={handleChange}
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



const DateRangeWithPortal = ({ departureTime = new Date(), arrivalTime = new Date(), roundTrip}) => {
    // keep dateRange as a stateful array [startDate, endDate]
    // const current = new Date();
    // const date = `${current.getMonth()+1}/${current.getDate()}/${current.getFullYear()}`;
    // // const next_date = `${current.getMonth()+1}/${current.getDate()+1}/${current.getFullYear()}`;
    const [dateRange, setDateRange] = useState([
      null,
      null
    ]);
    const [startDate, endDate] = dateRange;

    const [selectedDate, setSelectedDate] = useState(new Date());
    const handleChange = (date) => {
    if (roundTrip == 1) {
      setDateRange(date);

      // setDateRange now already works

      if (date[1]) {
        arrivalTime = `${date[1].getFullYear()}-${date[1].getMonth() + 1}-${date[1].getDate()}`;
      }
        departureTime = `${date[0].getFullYear()}-${date[0].getMonth() + 1}-${date[0].getDate()}`;

    } else {
      setSelectedDate(date);
      // one-way
      departureTime = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
    }
  };

      return (
    <DatePicker 
      startDate={startDate}
      endDate={endDate}

      onChange={handleChange}

      selectsRange
      withPortal
    />
  // <DatePicker selected={selectedDate} onChange={handleChange} withPortal/>

    );
  };

  function Form_Grid({ origin, setOrigin, destination, setDestination, departureTime,arrivalTime,roundTrip,setRoundTrip,handleSubmit }) {
  return (
    <Form onSubmit={handleSubmit}>
      <Row className={"justify-stretch m-2 topFormRow"}>
        <Col className="ml-2 p-0 m-0">
          <input
            type="text"
            placeholder="Origin Airport (e.g. JFK)"
            value={origin}
            required={true}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            className="border rounded-lg p-2 w-64 text-center"
          />
        </Col>
        <Col className={"p-0 m-0 arrow_col"}>
          <Redo className={" arrow"}/>
        </Col>
        <Col className="p-0 m-0">
          <input
            type="text"
            required={true}
            placeholder="Destination Airport (e.g. LAX)"
            value={destination}
            onChange={(e) => setDestination(e.target.value.toUpperCase())}
            className="border rounded-lg p-2 w-64 text-center"
          />
        </Col>
        <Col className="p-0 m-0 submit_button">
          <Button variant="primary" type="submit">
            Find Routes
          </Button>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <DateRangeWithPortal
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          roundTrip={roundTrip}/>
        </Col>
        <Col>
          <TravelClassSelect />
        </Col>
        <Col>
          <DirectSwitch
          roundTrip = {roundTrip}
          setRoundTrip = {setRoundTrip}
          />
        </Col>
      </Row>
    </Form>
  );
  }

  // RouteCard
  // A function that takes data about the trip (I forgot what data we were using but this is easily expanded)
  // returns a card containing all that data formatted horizontally
  // I only return a a string of vehicleType rn because idk what images were putting here

  const RouteCard = ({ vehicleType, companyLogo, company, cost, time, layovers, showRoutes }) => {
    const [expanded, setExpanded] = useState(false);
    const Chevron = expanded ? "▲" : "▼";
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
      <div className={classes}>
        {/* Top row */}
        <div className="companyName font-semibold text-blue-700">
          <IconComponent className="w-5 h-5 text-gray-600"/>

          <img src={companyLogo}/>
          <p>{company}</p>
        </div>
        <p className="font-medium">Cost = ${cost}</p>
        {time % 60 !== 0 ? (
            <p className="font-medium">{parseInt(time / 60)} hours and {time % 60} minutes</p>
        ) : (
            <p className="font-medium">{parseInt(time / 60)} hours</p>
        )}
        {layovers.length > 0 ? (
            <>
              {(() => {
                const layover_ids = layovers.slice(0, -1).map(l => l.arrival_id);
                return (
                  <>
                    <p>Layovers: ({layover_ids.join(", ")})</p>
                    <button onClick={() => setExpanded(!expanded)} className="text-xl select-none">
                      {Chevron}
                    </button>
                  </>
                );
              })()}
            </>
        ) : (
            <p>Direct</p>
        )}


        {/*/!* Dropdown section *!/*/}
          {expanded && (
            <div className="mt-3 p-3 bg-gray-100 rounded-lg text-left w-full">
              <p className="font-semibold mb-2">Trip Details:</p>
              <ul className="list-disc ml-5">
                <li>Segment 1: Departure from {layovers[0].departure_id} → {layovers[0].arrival_id}</li>
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
                              Segment {i+1}: {layovers[i - 1].arrival_id} → {layovers[i].arrival_id}
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

export default function AirportRoutes() {
  const current = new Date();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [roundTrip, setRoundTrip] = useState(2); // one way on start
  const [departureTime] = useState(`${current.getFullYear()}-${current.getMonth()+1}-${current.getDate()}`);
  const [arrivalTime] = useState(`${current.getFullYear()}-${current.getMonth()+1}-${current.getDate()+3}`);
  const [showRoutes, setShowRoutes] = useState(false);




  // Dummy route data. just call the function with the data we get from the api
  let Routes = [
    {id: 1, vehicleType: "Plane", companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/', company: "Delta Airlines", cost: "350", layovers: ["ORD"]},
    {id: 2, vehicleType: "Plane", companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/',company: "United Airlines", cost: "420", layovers: ["DFW", "DEN"]},
    {id: 3, vehicleType: "Train", companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/',company: "Amtrak", cost: "6969696", layovers: []},
    {id: 4, vehicleType: "Bus", companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/',company: "GreyHound", cost: "25", layovers: ["JFK"] },
    { id: 5, vehicleType: "Plane", companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/',company: "Ryanair", cost: "50", layovers: ["DFW", "DEN", "KAS", 'JFK'] },
    { id: 6, vehicleType: "Train",companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/', company: "BNSF Railway", cost: "3043", layovers: ["KAS", 'JFK'] },
    { id: 7, vehicleType: "Train",companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/', company: "Union Pacific", cost: "291", layovers: ["KSF", 'PEO'] },
    { id: 8, vehicleType: "Train", companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/',company: "Norfolk Southern", cost: "48", layovers: [] },
    { id: 9, vehicleType: "Bus", companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/',company: "GMT", cost: "38", layovers: [] },
    { id: 10, vehicleType: "buss", companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/',company: "fake company 1", cost: "23", layovers: ["helLA"] },
    { id: 11, vehicleType: "ahbfa", companyLogo: 'https://www.gstatic.com/flights/airline_logos/70px/F9.png/',company: "fake company 2", cost: "232", layovers: ["hell"] },
  ];


const handleSubmit = async (e) => {
  e.preventDefault();


  if(!isValidateText(origin)){
     alert('Your origin airport should just only be letters. For example: "IAD" or "SFO"');
    return;
  }
    if(!isValidateText(destination)){
     alert('Your destination airport should just only be letters. For example: "IAD" or "SFO"');
    return;
  }

  if (!origin || !destination) {
    alert("Please enter both origin and destination airports.");
    return;
  }
  if ((!(roundTrip == 2))&&(!(roundTrip == 1))){
    alert("Something is wrong with the Round trip Switch. Please try again!");
    return;
  }

  // const proxy = 'https://api.allorigins.win/get'
  const formData = new FormData(e.target)
  const formDataObj = Object.fromEntries(formData.entries())
  console.log(formDataObj)
  // const targetUrl = 'http://routefinder-api-env-prod.eba-egdm2f3j.us-east-1.elasticbeanstalk.com/flights/search/?' +
  // new URLSearchParams({
  //   departure_id: origin,
  //   arrival_id:   destination,
  //   hl:           "en",
  //   outbound_date:"2025-12-14",
  //   return_date:  "2025-12-16",
  //   // outbound_date: departureTime,
  //   // return_date:  arrivalTime,
  //   currency:     "USD",
  //   format:       "json",
  //   type: roundTrip //one way flight
  // }).toString();

  axios.get('https://routefinder.api.lukeholmes.dev/flights/search/', {
  params: {
    departure_id: origin,
    arrival_id:   destination,
    hl:           "en",
    // outbound_date:"2025-12-14",
    // return_date:  "2025-12-16",
    outbound_date: departureTime,
    return_date:  arrivalTime,
    currency:     "USD",
    // travel_class: ,
    format:       "json",
    type: roundTrip //one way flight
  }
  }).then(response => {
    console.log('Raw response:', response.data);
    console.log('Response type:', typeof response.data);
    
    // Parse the JSON string once
    const responses = response.data;
    
    console.log('Parsed response:', responses);
    console.log('Number of trips:', responses.outbound_trips.length);
    
    Routes = [];
    
    for(const trip_indx in responses.outbound_trips){
      let total_time = 0;
      let layovers = [];
      const trip = responses.outbound_trips[trip_indx];

      // Skip trips with null prices
      if (trip.price === null) continue;

      if (trip.flights.length > 1) {
        for(let i = 0; i < trip.flights.length; i++){
          total_time += trip.flights[i].duration;
          // Add layover for all flights including last one
          layovers.push(trip.flights[i])
        }
      } else {
        total_time = trip.flights[0].duration;
      }
      console.log('Response type:', layovers);

      Routes.push({
        id: trip_indx,
        companyLogo: trip.flights[0].airline_logo,
        vehicleType: "Plane",
        time: total_time,
        company: trip.flights[0].airline_name,
        cost: trip.price,
        layovers: layovers
      });
    }
    
    setRoutes(Routes);
    setTimeout(() => setShowRoutes(true), 100);
  })
  .catch(err => {
    console.error('Request failed:', err);
    alert('Failed to fetch flight data. Please try again.');
  });
};
  // axios.get('https://api.allorigins.win/get', { params: { url: targetUrl } })



{/* Da meat */}
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50 text-gray-800 p-6">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">
        <header className={""}>
          <a href={'https://main.d3oqjx740ps4dp.amplifyapp.com'}>
            <RoutefinderLogo width={200} height={200} className="mt-4"/>
          </a>
          <Form_Grid
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              departureTime={departureTime}
              arrivalTime={arrivalTime}
              roundTrip={roundTrip}
              setRoundTrip={setRoundTrip}
              handleSubmit={handleSubmit}
          />


        </header>

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








