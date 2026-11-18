import { useState } from "react";
import Summary from "./Components/Summary";
import Incidents from "./Components/Incidents";
import Conflicts from "./Components/Conflicts";
import Sightings from "./Components/Sightings";
import Resolve from "./Components/Resolve";
import Teach from "./Components/Teach";

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "incidents", label: "Incidents" },
  { id: "conflicts", label: "Conflicts" },
  { id: "sightings", label: "Sightings" },
  { id: "resolve", label: "Resolve" },
  { id: "teach", label: "Teach" },
];

export default function App() {
  const [page, setPage] = useState("incidents");

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-xl font-bold text-emerald-950">
            Wildlife Monitoring
          </h1>

          <nav className="flex flex-wrap gap-1.5 text-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setPage(t.id)}
                className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                  page === t.id
                    ? "bg-emerald-900 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {page === "summary" && <Summary />}
        {page === "incidents" && <Incidents />}
        {page === "conflicts" && <Conflicts />}
        {page === "sightings" && <Sightings />}
        {page === "resolve" && <Resolve />}
        {page === "teach" && <Teach />}
      </main>
    </div>
  );
}
