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
    setRoundTrip(e.target.checked ? 2 : 1);
  };

  return (
    <Form.Check
      type="switch"
      name="RoundTripSwitch"
      id="RoundTripSwitch"
      label="Round Trip?"
      checked={roundTrip === 2}
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



const DateRangeWithPortal = ({ departureTime = new Date(), arrivalTime = new Date()}) => {
    // keep dateRange as a stateful array [startDate, endDate]
    const current = new Date();
    const date = `${current.getMonth()+1}/${current.getDate()}/${current.getFullYear()}`;
    const next_date = `${current.getMonth()+1}/${current.getDate()+1}/${current.getFullYear()}`;
    const [dateRange, setDateRange] = useState([date, next_date]);
    const [startDate, endDate] = dateRange;

    return (
      <DatePicker
        selected={startDate}
        required={true}
        startDate={startDate}
        endDate={endDate}
        onChange={(update) => {
          setDateRange(update);
          /// need to make this work
          departureTime = `${startDate.getFullYear()}/${startDate.getMonth()+1}/${startDate.getDate()}`;
          arrivalTime =  `${endDate.getFullYear()}/${endDate.getMonth()+1}/${endDate.getDate()}`;
        }}
        selectsRange
        withPortal
        placeholderText="Select date range"
      />
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
          arrivalTime={arrivalTime}/>
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
        <div className="companyName font-semibold text-blue-700">
          <IconComponent className="w-5 h-5 text-gray-600"/>

          <img src={companyLogo}/>
          <p>{company}</p>
        </div>
        <p className="font-medium">Cost = ${cost}</p>
            { time % 60 !== 0 ? (
        <p className="font-medium">{parseInt(time / 60)} hours and {time % 60} minutes</p>
      ) : (
        <p className="font-medium">{parseInt(time / 60)} hours</p>
      )}
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
  const [roundTrip, setRoundTrip] = useState(1); // one way on start
  const [departureTime] = useState([]);
  const [arrivalTime] = useState([]);
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
    outbound_date:"2025-12-14",
    return_date:  "2025-12-16",
    // outbound_date: departureTime,
    // return_date:  arrivalTime,
    currency:     "USD",
    format:       "json",
    type: roundTrip //one way flight
  }
})
  // axios.get('https://api.allorigins.win/get', { params: { url: targetUrl } })
  //   .then(response => {
  //   const all_response = response.data.contents;
  //   try {
  //     const json_response = JSON.parse(all_response);
  //     const responses = JSON.parse(json_response);
  //     let total_time = 0;
  //     let layovers = [];
  //     console.log('Parsed proxied JSON:', json_response);
  //     console.log('length:',responses.outbound_trips.length)
  //     console.log('price:',responses.outbound_trips[0].price)
  //     console.log('roundtrip var :',roundTrip)
  //     Routes= []
  //     for(const trip_indx in responses.outbound_trips){
  //       total_time = 0;
  //       layovers = [];

  //       if (responses.outbound_trips[trip_indx].flights.length > 1) {
  //           for(const flight_indx in responses.outbound_trips[trip_indx].flights){
  //             total_time = total_time + responses.outbound_trips[trip_indx].flights[flight_indx].duration;
  //             if (flight_indx !== responses.outbound_trips[trip_indx].flights.length){
  //               layovers.push(responses.outbound_trips[trip_indx].flights[flight_indx].arrival_id)
  //             }
  //           }
  //         }
  //         else{
  //           total_time = responses.outbound_trips[trip_indx].flights[0].duration;
  //         }
  //       Routes.push({
  //         id: trip_indx,
  //         companyLogo: responses.outbound_trips[trip_indx].flights[0].airline_logo,
  //         vehicleType: "Plane",
  //         time: total_time,
  //         company: responses.outbound_trips[trip_indx].flights[0].airline_name,
  //         cost: `${responses.outbound_trips[trip_indx].price}`,
  //         layovers: layovers
  //       });
  //     }
  //     setRoutes(Routes)

  //     setRoutes(Routes);
  //     setTimeout(() => setShowRoutes(true), 1000);
  //   } catch (e) {
  //     console.log('Proxied text (not JSON):', all_response);
  //   }
  // })
  // .catch(err => {
  //   console.error('Request failed:', err.message);
  // });
};



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








