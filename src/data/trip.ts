export interface Activity {
  time: string;
  title: string;
  description: string;
  icon: string;
  location?: string;
  mapsUrl?: string;
}

export interface DayPlan {
  date: string;
  dayLabel: string;
  title: string;
  image: string;
  activities: Activity[];
}

export const tripInfo = {
  destination: "Sydney, Australia",
  dates: "July 21 – 28, 2026",
  travelers: ["Samuel", "Ruth", "Ryan (3 yrs)"],
  hotel: {
    name: "Adina Apartment Hotel Sydney Chippendale",
    location: "Chippendale, Sydney",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    mapsUrl:
      "https://maps.app.goo.gl/5prkhRnhyMHN4Fpw7",
  },
  flights: {
    outbound: {
      airline: "Qantas Airlines (Operated by China Airlines)",
      flightNo: "QF 8730",
      date: "July 21, 2026",
      departure: "11:30 PM TPE",
      arrival: "10:45 AM+1 SYD",
      duration: "9h 15m",
      direction: "Departure",
    },
    returnFlight: {
      airline: "Qantas Airlines (Operated by China Airlines)",
      flightNo: "QF 8729",
      date: "July 27, 2026",
      departure: "10:10 PM SYD",
      arrival: "5:40 AM+1 TPE",
      duration: "9h 30m",
      direction: "Return",
    },
  },
};

export const itinerary: DayPlan[] = [
  {
    date: "July 22 (Wed)",
    dayLabel: "Day 1",
    title: "Arrival & Darling Harbour",
    image:
      "https://images.unsplash.com/photo-1659684383997-adcabe839378?q=80&w=1471&auto=format&fit=crop",
    activities: [
      {
        time: "Morning",
        title: "Arrive in Sydney",
        description:
          "Depart TPE at 11:30 PM (7/21), land at Sydney Airport (SYD) at 10:45 AM via Qantas QF 8730 (operated by China Airlines). Transfer to Adina Apartment Hotel Sydney Chippendale.",
        icon: "plane-landing",
        location: "Sydney Airport",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Sydney+Kingsford+Smith+Airport",
      },
      {
        time: "Afternoon",
        title: "Check in & Rest",
        description:
          "Check in to Adina Apartment Hotel Sydney Chippendale. Settle in and rest after the overnight flight.",
        icon: "hotel",
        location: "Adina Apartment Hotel Sydney Chippendale",
        mapsUrl:
          "https://maps.app.goo.gl/5prkhRnhyMHN4Fpw7",
      },
      {
        time: "Evening",
        title: "Darling Harbour",
        description:
          "Stroll around Darling Harbour, enjoy the waterfront lights and grab dinner at one of the family-friendly restaurants.",
        icon: "ship",
        location: "Darling Harbour",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Darling+Harbour+Sydney",
      },
    ],
  },
  {
    date: "July 23 (Thu)",
    dayLabel: "Day 2",
    title: "Sydney Opera House & The Rocks",
    image:
      "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=800&q=80",
    activities: [
      {
        time: "Morning",
        title: "Sydney Opera House",
        description:
          "Tour the iconic Sydney Opera House. Consider booking a kid-friendly Junior Tour that runs around 1 hour.",
        icon: "landmark",
        location: "Sydney Opera House",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Sydney+Opera+House",
      },
      {
        time: "Afternoon",
        title: "The Rocks Market",
        description:
          "Explore The Rocks — Sydney's oldest neighborhood. Browse artisan stalls, street performers, and enjoy lunch with Harbour Bridge views.",
        icon: "store",
        location: "The Rocks",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=The+Rocks+Sydney",
      },
      {
        time: "Late Afternoon",
        title: "Circular Quay Walk",
        description:
          "Walk along Circular Quay with stunning views of the Harbour Bridge and Opera House. Great photo opportunities!",
        icon: "camera",
        location: "Circular Quay",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Circular+Quay+Sydney",
      },
    ],
  },
  {
    date: "July 24 (Fri)",
    dayLabel: "Day 3",
    title: "SEA LIFE Aquarium & Fish Market",
    image:
      "https://www.darlingharbour.com/getmedia/942467a1-59e6-44f3-897e-8a482c710090/sealife-aquarium-8.jpg",
    activities: [
      {
        time: "Morning",
        title: "SEA LIFE Sydney Aquarium",
        description:
          "Visit SEA LIFE Aquarium at Darling Harbour. Your son will love the shark walk, penguin exhibit, and dugong sanctuary.",
        icon: "fish",
        location: "SEA LIFE Sydney Aquarium",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=SEA+LIFE+Sydney+Aquarium",
      },
      {
        time: "Afternoon",
        title: "Sydney Fish Market",
        description:
          "Head to the Sydney Fish Market for a fresh seafood lunch. Try the famous Sydney rock oysters and fish & chips.",
        icon: "utensils",
        location: "Sydney Fish Market",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Sydney+Fish+Market",
      },
      {
        time: "Evening",
        title: "Relax at Hotel",
        description:
          "Take it easy back at the apartment — rest up with the little one after a busy day.",
        icon: "bed",
        location: "Adina Apartment Hotel Sydney Chippendale",
        mapsUrl:
          "https://maps.app.goo.gl/5prkhRnhyMHN4Fpw7",
      },
    ],
  },
  {
    date: "July 25 (Sat)",
    dayLabel: "Day 4",
    title: "Featherdale Wildlife Park",
    image:
      "https://images.unsplash.com/photo-1459262838948-3e2de6c1ec80?w=500&auto=format&fit=crop&q=60",
    activities: [
      {
        time: "Morning",
        title: "Featherdale Wildlife Park",
        description:
          "A full morning at Featherdale Wildlife Park. Get up close with koalas, kangaroos, wombats, and more. Perfect for a toddler!",
        icon: "paw-print",
        location: "Featherdale Wildlife Park",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Featherdale+Wildlife+Park+Sydney",
      },
      {
        time: "Afternoon",
        title: "Lunch & Explore Nearby",
        description:
          "Grab lunch near the park. Head back to the city at a relaxed pace.",
        icon: "utensils",
      },
      {
        time: "Late Afternoon",
        title: "Luna Park (Optional)",
        description:
          "If energy allows, check out Luna Park's family-friendly rides and the famous smiling face entrance.",
        icon: "ferris-wheel",
        location: "Luna Park Sydney",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Luna+Park+Sydney",
      },
    ],
  },
  {
    date: "July 26 (Sun)",
    dayLabel: "Day 5",
    title: "Manly Beach Day",
    image:
      "https://images.unsplash.com/photo-1729023410572-ae94d0019ec9?q=80&w=1469&auto=format&fit=crop",
    activities: [
      {
        time: "Morning",
        title: "Ferry to Manly Beach",
        description:
          "Take the iconic Manly Ferry from Circular Quay — a scenic 30-min ride through Sydney Harbour. Your son will love the boat ride!",
        icon: "ship",
        location: "Circular Quay → Manly",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Manly+Wharf+Sydney",
      },
      {
        time: "Midday",
        title: "Manly Beach",
        description:
          "Enjoy Manly Beach — build sandcastles with your son, splash in the shallows. Walk along The Corso for lunch and ice cream.",
        icon: "umbrella",
        location: "Manly Beach",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Manly+Beach+Sydney",
      },
      {
        time: "Afternoon",
        title: "Manly to Shelly Beach Walk",
        description:
          "A short, scenic walk from Manly to Shelly Beach — stroller-friendly and great for spotting marine life in rock pools.",
        icon: "footprints",
        location: "Shelly Beach",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Shelly+Beach+Manly+Sydney",
      },
    ],
  },
  {
    date: "July 27 (Mon)",
    dayLabel: "Day 6",
    title: "QVB Shopping & Farewell Dinner",
    image:
      "https://images.unsplash.com/photo-1668376186936-7d003242d9a1?q=80&w=1470&auto=format&fit=crop",
    activities: [
      {
        time: "Morning",
        title: "Queen Victoria Building (QVB)",
        description:
          "Explore the gorgeous QVB — a heritage shopping arcade with beautiful architecture. Pick up souvenirs and enjoy the Royal Clock.",
        icon: "shopping-bag",
        location: "Queen Victoria Building",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Queen+Victoria+Building+Sydney",
      },
      {
        time: "Afternoon",
        title: "Hyde Park & Surrounds",
        description:
          "Walk through Hyde Park, let your son run around the lawns and fountains. Visit the nearby St. Mary's Cathedral.",
        icon: "trees",
        location: "Hyde Park",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Hyde+Park+Sydney",
      },
      {
        time: "Evening",
        title: "Farewell Dinner at Darling Harbour",
        description:
          "Enjoy a farewell dinner at Darling Harbour overlooking the water, then head to Sydney Airport for the 10:10 PM Qantas QF 8729 return flight.",
        icon: "wine",
        location: "Darling Harbour",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Darling+Harbour+Sydney",
      },
      {
        time: "Night",
        title: "Depart Sydney",
        description:
          "Qantas QF 8729 departs SYD at 10:10 PM, arriving TPE at 5:40 AM+1. Safe travels home!",
        icon: "plane",
        location: "Sydney Airport",
        mapsUrl:
          "https://www.google.com/maps/search/?api=1&query=Sydney+Kingsford+Smith+Airport",
      },
    ],
  },
];
