import { useState } from "react";
import useStored from "../useStored";

const today = () => new Date().toISOString().slice(0, 10);
const blank = { species: "", count: "", location: "", date: today(), notes: "" };
const field = "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30";

export default function Sightings() {
  const [items, setItems] = useStored("sightings", []);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const n = parseInt(form.count, 10);
    if (!form.species.trim() || !n || n < 1) {
      setError("Enter the species and a count of at least 1.");
      return;
    }
    setError("");
    setItems([{ ...form, species: form.species.trim(), count: n, id: Date.now() }, ...items]);
    setForm(blank);
  }

  const totals = Object.entries(
    items.reduce((acc, i) => {
      const key = i.species.toLowerCase();
      acc[key] = (acc[key] || 0) + i.count;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const max = totals[0]?.[1] || 1;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Log a count</h2>
        <label className="block text-sm">Species
          <input className={field} value={form.species} onChange={set("species")} placeholder="Elephant" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">How many
            <input type="number" min="1" className={field} value={form.count} onChange={set("count")} />
          </label>
          <label className="block text-sm">Date
            <input type="date" className={field} value={form.date} onChange={set("date")} />
          </label>
        </div>
        <label className="block text-sm">Location
          <input className={field} value={form.location} onChange={set("location")} />
        </label>
        <label className="block text-sm">Notes
          <textarea rows={2} className={field} value={form.notes} onChange={set("notes")} />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button className="w-full rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          Save count
        </button>
      </form>

      <section className="space-y-6">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Totals by species</h2>
          {totals.length === 0 ? (
            <p className="text-sm text-stone-600">No counts yet. Log your first sighting to see totals here.</p>
          ) : (
            <ul className="space-y-2">
              {totals.map(([name, total]) => (
                <li key={name} className="text-sm">
                  <div className="flex justify-between"><span className="capitalize">{name}</span><span>{total}</span></div>
                  <div className="mt-1 h-2 rounded bg-stone-200">
                    <div className="h-2 rounded bg-emerald-700" style={{ width: `${(total / max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-lg bg-white p-3 text-sm shadow-sm">
                <span><strong>{i.count}</strong> {i.species}, {i.location || "no location"}, {i.date}</span>
                <button onClick={() => setItems(items.filter((x) => x.id !== i.id))} className="text-red-700 hover:underline">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}