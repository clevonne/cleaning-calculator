import React, { useState, useEffect } from "react";

const CleaningCalculator = () => {
  const [propertyType, setPropertyType] = useState("residential");
  const [facilityType, setFacilityType] = useState("");
  const [cleanType, setCleanType] = useState("standard");
  const [squareFootage, setSquareFootage] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [carpetFootage, setCarpetFootage] = useState(0);
  const [frequency, setFrequency] = useState("once");
  const [days, setDays] = useState([]);
  const [addOns, setAddOns] = useState({});
  const [addOnInputs, setAddOnInputs] = useState({});
  const [total, setTotal] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(null);
  const [carpetTotal, setCarpetTotal] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [serviceBreakdown, setServiceBreakdown] = useState({});

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const facilityTypes = [
    "Medical Office", "Dental Office", "Office Building", "Retail Store",
    "Bank", "Church", "Gym", "Daycare", "School", "Warehouse", "Other"
  ];

  const serviceRates = {
    carpetCleaning: [
      { min: 0, max: 2500, rate: 0.4 },
      { min: 2501, max: 5000, rate: 0.35 },
      { min: 5001, max: 7500, rate: 0.28 },
      { min: 7501, max: 10000, rate: 0.21 }
    ],
    stripAndWax: [
      { min: 0, max: 2500, rate: 1.5 },
      { min: 2501, max: 5000, rate: 0.9 },
      { min: 5001, max: 7500, rate: 0.72 },
      { min: 7501, max: 10000, rate: 0.54 }
    ],
    tileAndGrout: [
      { min: 0, max: 2500, rate: 2.0 },
      { min: 2501, max: 5000, rate: 1.5 },
      { min: 5001, max: 7500, rate: 1.2 },
      { min: 7501, max: 10000, rate: 0.9 }
    ],
    sanitation: [
      { min: 0, max: 2500, rate: 0.5 },
      { min: 2501, max: 5000, rate: 0.4 },
      { min: 5001, max: 7500, rate: 0.32 },
      { min: 7501, max: 10000, rate: 0.24 }
    ],
    eventSpace: [
      { min: 0, max: 2500, rate: 1.5 },
      { min: 2501, max: 5000, rate: 1.25 },
      { min: 5001, max: 7500, rate: 1.0 },
      { min: 7501, max: 10000, rate: 0.75 }
    ],
    venueTheater: [
      { min: 0, max: 2500, rate: 1.0 },
      { min: 2501, max: 5000, rate: 0.8 },
      { min: 5001, max: 7500, rate: 0.6 },
      { min: 7501, max: 10000, rate: 0.48 }
    ]
  };

  const productionRates = {
    "Medical Office": 2500,
    "Dental Office": 2000,
    "Office Building": 3000,
    "Retail Store": 3500,
    "Bank": 2800,
    "Church": 4000,
    "Gym": 3000,
    "Daycare": 2200,
    "School": 3200,
    "Warehouse": 5000
  };

  const residentialBasePrices = {
    standard: [
      { bedrooms: 1, bathrooms: 1, price: 120 },
      { bedrooms: 2, bathrooms: 1, price: 130 },
      { bedrooms: 2, bathrooms: 2, price: 140 },
      { bedrooms: 3, bathrooms: 2, price: 150 },
      { bedrooms: 3, bathrooms: 3, price: 160 },
      { bedrooms: 4, bathrooms: 3, price: 180 },
      { bedrooms: 4, bathrooms: 4, price: 200 },
      { bedrooms: 5, bathrooms: 4, price: 220 }
    ],
    deep: [
      { bedrooms: 1, bathrooms: 1, price: 170 },
      { bedrooms: 2, bathrooms: 1, price: 190 },
      { bedrooms: 2, bathrooms: 2, price: 210 },
      { bedrooms: 3, bathrooms: 2, price: 230 },
      { bedrooms: 3, bathrooms: 3, price: 250 },
      { bedrooms: 4, bathrooms: 3, price: 270 },
      { bedrooms: 4, bathrooms: 4, price: 290 },
      { bedrooms: 5, bathrooms: 4, price: 310 }
    ],
    move: [
      { bedrooms: 1, bathrooms: 1, price: 200 },
      { bedrooms: 2, bathrooms: 1, price: 220 },
      { bedrooms: 2, bathrooms: 2, price: 240 },
      { bedrooms: 3, bathrooms: 2, price: 260 },
      { bedrooms: 3, bathrooms: 3, price: 280 },
      { bedrooms: 4, bathrooms: 3, price: 300 },
      { bedrooms: 4, bathrooms: 4, price: 320 },
      { bedrooms: 5, bathrooms: 4, price: 340 }
    ]
  };

  useEffect(() => {
    const frequencyDiscounts = {
      once: 1,
      weekly: 0.85,
      biweekly: 0.9,
      monthly: 0.95,
      daily: 0.8
    };

    const getServiceRate = (service, footage) => {
      const tier = serviceRates[service]?.find(
        (t) => footage >= t.min && footage <= t.max
      );
      return tier ? tier.rate : 0;
    };

    const getMinimum = (service) => {
      const minimums = {
        carpetCleaning: 135,
        stripAndWax: 350,
        tileAndGrout: 250,
        sanitation: 400,
        eventSpace: 175,
        venueTheater: 175
      };
      return minimums[service] || 0;
    };

    let base = 0;
    let carpetCost = 0;
    let extraCost = 0;
    let breakdown = {};
    let hours = 0;

    if (propertyType === "residential") {
      const match = residentialBasePrices[cleanType]?.find(
        (item) => item.bedrooms === bedrooms && item.bathrooms === bathrooms
      );
      base = match ? match.price : 0;
    } else if (propertyType === "commercial") {
      const effectiveFacility = facilityType === "Other" ? "Retail Store" : facilityType;
      const productionRate = productionRates[effectiveFacility];
      if (productionRate && squareFootage > 0) {
        hours = squareFootage / productionRate;
        base = 45 * hours;
      }
    }

    setEstimatedHours(hours.toFixed(2));

    if (propertyType === "commercial") {
      Object.entries(addOns).forEach(([key, value]) => {
        if (!value) return;
        if (key === "carpetCleaning") {
          const rate = getServiceRate(key, carpetFootage);
          carpetCost = Math.max(carpetFootage * rate, getMinimum(key));
        } else {
          const sqft = parseFloat(addOnInputs[key]) || 0;
          const rate = getServiceRate(key, sqft);
          const cost = Math.max(sqft * rate, getMinimum(key));
          extraCost += cost;
          breakdown[key] = cost;
        }
      });
    }

    const perClean = Math.max(base * frequencyDiscounts[frequency], 120);
    setTotal((perClean + extraCost).toFixed(2));
    setCarpetTotal(carpetCost.toFixed(2));
    setServiceBreakdown(breakdown);

    let monthly = null;
    if (propertyType === "commercial" && cleanType === "standard") {
      if (frequency === "daily") {
        monthly = perClean * days.length * 4;
      } else if (frequency === "weekly") {
        monthly = perClean * 4;
      } else if (frequency === "biweekly") {
        monthly = perClean * 2;
      } else if (frequency === "monthly") {
        monthly = perClean * 4.33;
      }
    }
    if (monthly) setMonthlyTotal(monthly.toFixed(2));
    else setMonthlyTotal(null);
  }, [
    propertyType,
    facilityType,
    cleanType,
    squareFootage,
    bedrooms,
    bathrooms,
    carpetFootage,
    frequency,
    days,
    addOns,
    addOnInputs
  ]);

  return <div className="max-w-xl mx-auto p-4 space-y-6 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-bold">Cleaning Calculator</h2>

      <label className="block text-sm font-medium text-gray-700">Property Type</label>
      <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
        <option value="residential">Residential</option>
        <option value="commercial">Commercial</option>
      </select>

      {propertyType === "residential" && (
        <>
          <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
          <input type="number" className="mt-1 block w-full border rounded-md p-2" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
          <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
          <input type="number" className="mt-1 block w-full border rounded-md p-2" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} />
        </>
      )}

      {propertyType === "commercial" && (
        <>
          <label className="block text-sm font-medium text-gray-700">Facility Type</label>
          <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={facilityType} onChange={(e) => setFacilityType(e.target.value)}>
            <option value="">Select Facility</option>
            {facilityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-700">Square Footage</label>
          <input type="number" className="mt-1 block w-full border rounded-md p-2" value={squareFootage} onChange={(e) => setSquareFootage(Number(e.target.value))} />
        </>
      )}

      <label className="block text-sm font-medium text-gray-700">Cleaning Type</label>
      <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={cleanType} onChange={(e) => setCleanType(e.target.value)}>
        <option value="standard">Standard</option>
        <option value="deep">Deep Clean</option>
        {propertyType === "residential" && <option value="move">Move In/Out</option>}
      </select>

      {cleanType === "standard" && (
        <>
          <label className="block text-sm font-medium text-gray-700">Frequency</label>
          <select className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="once">Once</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            {propertyType === "commercial" && <option value="daily">Daily</option>}
          </select>

          {propertyType === "commercial" && frequency === "daily" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Days</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daysOfWeek.map(day => (
                  <label key={day} className="flex items-center gap-1">
                    <input type="checkbox" checked={days.includes(day)} onChange={() => setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])} />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {propertyType === "commercial" && (
        <>
          <label className="block text-sm font-medium text-gray-700 mt-4">Add-On Services</label>
          {Object.keys(serviceRates).map(service => (
            <div key={service} className="mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!addOns[service]} onChange={() => setAddOns(prev => ({ ...prev, [service]: !prev[service] }))} />
                {service.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
              </label>
              {addOns[service] && service !== "carpetCleaning" && (
                <input
                  type="number"
                  placeholder="Enter area (sqft)"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={addOnInputs[service] || ""}
                  onChange={(e) => setAddOnInputs(prev => ({ ...prev, [service]: e.target.value }))}
                />
              )}
            </div>
          ))}
          {addOns.carpetCleaning && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Carpet Area (sqft)</label>
              <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md p-2" value={carpetFootage} onChange={(e) => setCarpetFootage(Number(e.target.value))} />
            </div>
          )}
        </>
      )}

      {estimatedHours > 0 && (
        <div className="text-sm text-gray-700">Estimated Cleaning Time: {estimatedHours} hrs</div>
      )}

      <div className="text-md font-medium text-gray-700 border-t pt-4">Service Breakdown:</div>
      <ul className="text-sm text-gray-600">
        {Object.entries(serviceBreakdown).map(([service, cost]) => (
          <li key={service}>{service.replace(/([A-Z])/g, ' $1')}: ${cost.toFixed(2)}</li>
        ))}
      </ul>

      {carpetTotal > 0 && (
        <div className="text-md font-medium text-gray-600">
          One-time Carpet Cleaning Cost: ${carpetTotal}
        </div>
      )}

      <div className="text-lg font-semibold pt-2">Total per Cleaning: ${total}</div>

      {monthlyTotal && (
        <div className="text-lg font-semibold text-blue-700 border-t pt-2">
          Estimated Monthly Total: ${monthlyTotal}
        </div>
      )}
    </div>;
};

export default CleaningCalculator;
