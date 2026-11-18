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
  type: CONFLICT_TYPES[0],
  species: "",
  community: "",
  date: today(),
  severity: "Medium",
  mitigation: "",
  description: "",
  photo: "",
};

export default function Conflicts() {
  const [items, setItems] = useStored("conflicts", []);
  const [form, setForm] = useState(blank);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function addPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const photo = await shrinkImage(file);
    setForm((cur) => ({ ...cur, photo }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.species.trim() || !form.community.trim()) {
      setError("Enter the wildlife species and the affected community before saving.");
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
    <div>
      <form onSubmit={submit}>
        <h2>Log a conflict</h2>

        <div>
          <label>
            Conflict type{" "}
            <select value={form.type} onChange={set("type")}>
              {CONFLICT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label>
            Wildlife species{" "}
            <input
              value={form.species}
              onChange={set("species")}
              placeholder="Elephant, lion, hyena..."
            />
          </label>
        </div>

        <div>
          <label>
            Community / Ward{" "}
            <input
              value={form.community}
              onChange={set("community")}
              placeholder="Village or area"
            />
          </label>
        </div>

        <div>
          <label>
            Date started{" "}
            <input type="date" value={form.date} onChange={set("date")} />
          </label>
        </div>

        <div>
          <label>
            Escalation level{" "}
            <select value={form.severity} onChange={set("severity")}>
              {SEVERITY.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label>
            Mitigation action{" "}
            <input
              value={form.mitigation}
              onChange={set("mitigation")}
              placeholder="Chili fence, ranger patrol..."
            />
          </label>
        </div>

        <div>
          <label>
            Conflict details{" "}
            <textarea
              rows={3}
              value={form.description}
              onChange={set("description")}
            />
          </label>
        </div>

        <div>
          <label>
            Photo (optional){" "}
            <input
              key={form.photo ? "has" : "none"}
              type="file"
              accept="image/*"
              onChange={addPhoto}
            />
          </label>
        </div>

        {form.photo && <img src={form.photo} alt="Selected conflict" width="200" />}

        {error && <p role="alert">{error}</p>}

        <button type="submit">Save conflict</button>
      </form>

      <hr />

      <section>
        <h2>Conflicts ({shown.length})</h2>

        <div>
          {["All", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)}>
              {filter === s ? `[${s}]` : s}
            </button>
          ))}
        </div>

        {items.length > 0 && (
          <p>
            {STATUSES.map(
              (s) => `${s}: ${items.filter((i) => i.status === s).length}`
            ).join(" | ")}
          </p>
        )}

        {shown.length === 0 ? (
          <p>No conflicts here yet. Fill in the form to record the first one.</p>
        ) : (
          <ul>
            {shown.map((i) => (
              <li key={i.id}>
                <p>
                  <strong>
                    {i.type}: {i.species}
                  </strong>{" "}
                  ({i.status})
                </p>
                <p>
                  {i.community}, {i.date}, escalation {i.severity.toLowerCase()}
                </p>
                {i.mitigation && <p>Mitigation: {i.mitigation}</p>}
                {i.description && <p>{i.description}</p>}
                {i.photo && (
                  <img src={i.photo} alt={`${i.species} conflict`} width="200" />
                )}
                <div>
                  <select
                    aria-label="Change status"
                    value={i.status}
                    onChange={(e) => setStatus(i.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>{" "}
                  <button onClick={() => remove(i.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
