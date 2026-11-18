import { useState } from "react";
import useStored from "../useStored";
import { shrinkImage } from "../ImageUtil";

const CONFLICT_TYPES = [
  "Resource competition",
  "Habitat encroachment",
  "Retaliatory killing",
  "Livestock depredation",
  "Crop destruction",
  "Water point dispute",
  "Other",
];

const SEVERITY = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Active", "Mediating", "Resolved"];

const today = () => new Date().toISOString().slice(0, 10);

const blank = {
  type: CONFLICT_TYPES,
  species: "",
  community: "",
  date: today(),
  severity: "Medium",
  mitigation: "",
  description: "",
  photo: "",
};

const field =
  "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30";

const statusStyle = {
  Active: "bg-red-100 text-red-900",
  Mediating: "bg-amber-100 text-amber-900",
  Resolved: "bg-emerald-100 text-emerald-900",
};

export default function Conflicts() {
  const [items, setItems] = useStored("conflicts", []);
  const [form, setForm] = useState(blank);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function addPhoto(e) {
    const file = e.target.files;
    if (!file) return;
    const photo = await shrinkImage(file);
    setForm((cur) => ({ ...cur, photo }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.species.trim() || !form.community.trim()) {
      setError(
        "Enter the wildlife species and the affected community before saving."
      );
      return;
    }
    setError("");
    setItems([{ ...form, id: Date.now(), status: "Active" }, ...items]);
    setForm(blank);
  }

  const setStatus = (id, status) =>
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));

  const remove = (id) => setItems(items.filter((i) => i.id !== id));

  const shown =
    filter === "All" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={submit}
        className="space-y-4 rounded-lg bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold">Log a conflict</h2>

        <label className="block text-sm">
          Conflict type
          <select className={field} value={form.type} onChange={set("type")}>
            {CONFLICT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Wildlife species
          <input
            className={field}
            value={form.species}
            onChange={set("species")}
            placeholder="Elephant, lion, hyena, baboon..."
          />
        </label>

        <label className="block text-sm">
          Community / Ward
          <input
            className={field}
            value={form.community}
            onChange={set("community")}
            placeholder="Village, ward, or boundary area"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            Date started
            <input
              type="date"
              className={field}
              value={form.date}
              onChange={set("date")}
            />
          </label>

          <label className="block text-sm">
            Escalation level
            <select
              className={field}
              value={form.severity}
              onChange={set("severity")}
            >
              {SEVERITY.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          Mitigation / Response action
          <input
            className={field}
            value={form.mitigation}
            onChange={set("mitigation")}
            placeholder="e.g., Chili fence, ranger patrol, kraal reinforcement"
          />
        </label>

        <label className="block text-sm">
          Conflict details
          <textarea
            rows={3}
            className={field}
            value={form.description}
            onChange={set("description")}
            placeholder="Describe ongoing triggers, damages, or community concerns..."
          />
        </label>

        <label className="block text-sm">
          Evidence photo (optional)
          <input
            key={form.photo ? "has" : "none"}
            type="file"
            accept="image/*"
            onChange={addPhoto}
            className="mt-1 block w-full text-sm"
          />
        </label>

        {form.photo && (
          <img
            src={form.photo}
            alt="Selected conflict evidence"
            className="h-32 w-full rounded-md object-cover"
          />
        )}

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button className="w-full rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
          Save conflict
        </button>
      </form>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Conflicts ({shown.length})</h2>
          <div className="flex gap-1 text-sm">
            {["All", ...STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1 ${
                  filter === s
                    ? "bg-emerald-900 text-white"
                    : "bg-white text-stone-700 hover:bg-stone-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {STATUSES.length > 0 && items.length > 0 && (
          <div className="mb-4 grid grid-cols-3 gap-3">
            {STATUSES.map((s) => (
              <div key={s} className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-2xl font-semibold">
                  {items.filter((i) => i.status === s).length}
                </div>
                <div className="text-xs text-stone-600">{s}</div>
              </div>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-sm text-stone-600">
            No conflicts logged here yet. Fill in the form to record the first
            one.
          </p>
        ) : (
          <ul className="space-y-3">
            {shown.map((i) => (
              <li key={i.id} className="rounded-lg bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {i.type}: {i.species}
                    </p>
                    <p className="text-sm text-stone-600">
                      {i.community} • Started {i.date} • Escalation:{" "}
                      {i.severity.toLowerCase()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusStyle[i.status]
                    }`}
                  >
                    {i.status}
                  </span>
                </div>

                {i.mitigation && (
                  <p className="mt-2 rounded bg-stone-50 px-2.5 py-1.5 text-xs text-stone-700">
                    <span className="font-medium">Mitigation:</span>{" "}
                    {i.mitigation}
                  </p>
                )}

                {i.description && (
                  <p className="mt-2 text-sm">{i.description}</p>
                )}

                {i.photo && (
                  <img
                    src={i.photo}
                    alt={`${i.species} conflict`}
                    className="mt-3 h-44 w-full rounded-md object-cover sm:w-80"
                  />
                )}

                <div className="mt-3 flex items-center gap-3 text-sm">
                  <select
                    aria-label="Change conflict status"
                    className="rounded border border-stone-300 px-2 py-1"
                    value={i.status}
                    onChange={(e) => setStatus(i.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(i.id)}
                    className="text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
