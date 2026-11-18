import { useState } from "react";
import useStored from "../useStored";

const STEPS = ["Hear each side", "Agree on the facts", "Choose a way forward", "Record the agreement"];
const WAYS = ["Compensation", "Fencing or deterrents", "Ranger patrols", "Mediation by a village leader", "Other"];
const field = "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30";
const blank = { partyA: "", accountA: "", partyB: "", accountB: "", facts: "", ways: [], agreement: "", date: "" };

export default function Resolve() {
  const [incidents, setIncidents] = useStored("incidents", []);
  const [records, setRecords] = useStored("resolutions", {});
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const incident = incidents.find((i) => i.id === selected);
  const data = (selected && records[selected]) || blank;
  const update = (patch) => setRecords({ ...records, [selected]: { ...data, ...patch } });
  const set = (k) => (e) => update({ [k]: e.target.value });
  const toggleWay = (w) => update({ ways: data.ways.includes(w) ? data.ways.filter((x) => x !== w) : [...data.ways, w] });

  function open(id) {
    setSelected(id);
    setStep(0);
    setError("");
  }

  function next() {
    if (step === 0 && (!data.accountA.trim() || !data.accountB.trim())) {
      setError("Write down what each side says happened before moving on.");
      return;
    }
    if (step === 1 && !data.facts.trim()) {
      setError("Write the facts both sides accept.");
      return;
    }
    if (step === 2 && data.ways.length === 0) {
      setError("Choose at least one way forward.");
      return;
    }
    setError("");
    setStep(step + 1);
  }

  function finish() {
    if (!data.agreement.trim()) {
      setError("Describe what everyone agreed to do.");
      return;
    }
    setError("");
    update({ date: new Date().toISOString().slice(0, 10) });
    setIncidents(incidents.map((i) => (i.id === selected ? { ...i, status: "Resolved" } : i)));
  }

  if (incidents.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-sm text-stone-600">
        There are no cases to work on yet. Record an incident first, then come back to resolve it.
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <aside>
        <h2 className="mb-3 text-lg font-semibold">Choose a case</h2>
        <ul className="space-y-2">
          {incidents.map((i) => (
            <li key={i.id}>
              <button
                onClick={() => open(i.id)}
                className={`w-full rounded-lg p-3 text-left text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
                  selected === i.id ? "bg-emerald-900 text-white" : "bg-white hover:bg-stone-50"
                }`}
              >
                <span className="block font-medium">{i.type}: {i.animal}</span>
                <span className={selected === i.id ? "text-emerald-200" : "text-stone-600"}>{i.location}, {i.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        {!incident ? (
          <p className="text-sm text-stone-600">Pick a case on the left to start working through it.</p>
        ) : data.date ? (
          <div>
            <h2 className="text-lg font-semibold">Resolved on {data.date}</h2>
            <p className="mt-1 text-sm text-stone-600">{incident.type}: {incident.animal}, {incident.location}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="font-medium">Ways forward</dt><dd>{data.ways.join(", ")}</dd></div>
              <div><dt className="font-medium">Agreement</dt><dd>{data.agreement}</dd></div>
              <div><dt className="font-medium">Agreed facts</dt><dd>{data.facts}</dd></div>
            </dl>
            <button onClick={() => update({ date: "" })} className="mt-5 text-sm text-emerald-800 hover:underline">Reopen this case</button>
          </div>
        ) : (
          <div>
            <ol className="mb-6 flex flex-wrap gap-2 text-sm">
              {STEPS.map((s, idx) => (
                <li key={s} className={`rounded-full px-3 py-1 ${idx === step ? "bg-emerald-900 text-white" : idx < step ? "bg-emerald-100 text-emerald-900" : "bg-stone-100 text-stone-600"}`}>
                  {idx + 1}. {s}
                </li>
              ))}
            </ol>

            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {[["A", "partyA", "accountA"], ["B", "partyB", "accountB"]].map(([n, p, a]) => (
                  <div key={n} className="space-y-2">
                    <label className="block text-sm">Name of person or group {n}
                      <input className={field} value={data[p]} onChange={set(p)} />
                    </label>
                    <label className="block text-sm">What they say happened
                      <textarea rows={5} className={field} value={data[a]} onChange={set(a)} />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {step === 1 && (
              <label className="block text-sm">Facts both sides accept
                <textarea rows={6} className={field} value={data.facts} onChange={set("facts")} placeholder="Where, when, and what was damaged or lost." />
              </label>
            )}

            {step === 2 && (
              <fieldset>
                <legend className="mb-2 text-sm">Which ways forward will you try?</legend>
                <div className="space-y-2">
                  {WAYS.map((w) => (
                    <label key={w} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.ways.includes(w)} onChange={() => toggleWay(w)} /> {w}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 3 && (
              <label className="block text-sm">What everyone agreed to do, and by when
                <textarea rows={6} className={field} value={data.agreement} onChange={set("agreement")} />
              </label>
            )}

            {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}

            <div className="mt-6 flex justify-between">
              <button disabled={step === 0} onClick={() => { setError(""); setStep(step - 1); }} className="rounded-md px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-40">Back</button>
              {step < 3 ? (
                <button onClick={next} className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900">Next</button>
              ) : (
                <button onClick={finish} className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900">Mark case resolved</button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}