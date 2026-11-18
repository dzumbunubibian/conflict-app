import { useState } from "react";
import useStored from "../useStored";

const LESSONS = [
  {
    id: "safety",
    image: "/lesson-safety.jpg",
    title: "Staying safe around wildlife",
    body: [
      "Keep a large distance from wild animals, and never try to get close for a photo or a better look.",
      "Never come between a mother and her young. Animals with calves or cubs are the most likely to charge.",
      "Avoid walking near rivers, waterholes and thick bush at dusk, at night and at dawn, when many animals are active.",
      "If an animal notices you, stay calm, back away slowly and keep an escape route. Do not run toward it or turn your back and sprint.",
    ],
    quiz: [
      { q: "Which situation is most dangerous?", options: ["Watching from far away", "Getting between a mother and her young", "Walking in a group by day"], answer: 1 },
      { q: "An animal has noticed you. What should you do first?", options: ["Back away slowly and calmly", "Run straight at it", "Make sudden loud noises up close"], answer: 0 },
    ],
  },
  {
    id: "crops",
    image: "/lesson-crops.jpg",
    title: "Protecting crops",
    body: [
      "Chili fences: rope or cloth soaked in a chili and grease mix, hung around a field. The smell and sting put many animals off, especially elephants.",
      "Beehive fences: hives hung along the field edge. Elephants avoid bees, and you can harvest honey for extra income.",
      "Early warning: lights, noise makers and guard rotations help you drive animals away before they reach the crop.",
      "Plant crops animals dislike along the edge, and keep fields close together so fewer people need to guard them.",
    ],
    quiz: [
      { q: "What do beehive fences protect against?", options: ["Elephants", "Drought", "Soil erosion"], answer: 0 },
      { q: "Why keep fields close together?", options: ["It is easier to guard them", "It stops rain damage", "It attracts more animals"], answer: 0 },
    ],
  },
  {
    id: "after",
    image: "/lesson-after.jpg",
    title: "After an incident",
    body: [
      "Make sure everyone is safe and away from the animal first. Get medical help for any injury, even a small one.",
      "Do not chase or confront the animal. Keep your distance and let rangers deal with it.",
      "Report the incident to a ranger or local leader as soon as you can, and record it in this app.",
      "Take photos of damage and note the date, place and animal. This evidence supports compensation and helps spot patterns.",
    ],
    quiz: [
      { q: "What comes first after an incident?", options: ["Take photos of the damage", "Make sure everyone is safe", "Chase the animal away"], answer: 1 },
      { q: "Why record the incident?", options: ["It helps with compensation and spotting patterns", "It scares animals off", "It is only for tourists"], answer: 0 },
    ],
  },
];

const field = "w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/30";
const today = () => new Date().toISOString().slice(0, 10);
const btn = "rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

function Pic({ src, alt, className }) {
  const [ok, setOk] = useState(true);
  return ok ? <img src={src} alt={alt} onError={() => setOk(false)} className={className} /> : null;
}

function Lesson({ lesson, done, onComplete, onBack }) {
  const [picked, setPicked] = useState({});
  const [checked, setChecked] = useState(false);
  const score = lesson.quiz.filter((q, i) => picked[i] === q.answer).length;
  const passed = checked && score === lesson.quiz.length;

  function check() {
    setChecked(true);
    if (score === lesson.quiz.length) onComplete(lesson.id);
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <button onClick={onBack} className="mb-4 text-sm text-emerald-800 hover:underline">Back to lessons</button>
      <h2 className="text-xl font-semibold">{lesson.title}</h2>
      <Pic src={lesson.image} alt={lesson.title} className="mt-3 h-56 w-full rounded-lg object-cover" />
      <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-sm leading-relaxed">
        {lesson.body.map((p) => <li key={p}>{p}</li>)}
      </ul>
      <h3 className="mt-6 font-semibold">Check what you learned {done && "(completed)"}</h3>
      <div className="mt-3 space-y-4">
        {lesson.quiz.map((q, i) => (
          <fieldset key={q.q}>
            <legend className="text-sm font-medium">{q.q}</legend>
            {q.options.map((o, j) => (
              <label key={o} className="mt-1 flex items-center gap-2 text-sm">
                <input type="radio" name={`q${i}`} checked={picked[i] === j} onChange={() => { setPicked({ ...picked, [i]: j }); setChecked(false); }} /> {o}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <button onClick={check} disabled={Object.keys(picked).length < lesson.quiz.length} className={`${btn} mt-5 disabled:opacity-40`}>Check answers</button>
      {checked && (
        <p role="status" className={`mt-3 text-sm ${passed ? "text-emerald-800" : "text-red-700"}`}>
          {passed ? "All correct. Lesson completed." : `You got ${score} of ${lesson.quiz.length}. Read the lesson again and try once more.`}
        </p>
      )}
    </div>
  );
}

function ClassLog() {
  const [sessions, setSessions] = useStored("sessions", []);
  const [form, setForm] = useState({ topic: LESSONS[0].title, place: "", date: today(), people: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const n = parseInt(form.people, 10);
    if (!form.place.trim() || !n || n < 1) {
      setError("Enter the place and how many people came.");
      return;
    }
    setError("");
    setSessions([{ ...form, people: n, id: Date.now() }, ...sessions]);
    setForm({ ...form, place: "", people: "" });
  }
  const total = sessions.reduce((sum, s) => sum + s.people, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Log a class</h2>
        <label className="block text-sm">Topic
          <select className={field} value={form.topic} onChange={set("topic")}>
            {LESSONS.map((l) => <option key={l.id}>{l.title}</option>)}
          </select>
        </label>
        <label className="block text-sm">Place
          <input className={field} value={form.place} onChange={set("place")} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">Date
            <input type="date" className={field} value={form.date} onChange={set("date")} />
          </label>
          <label className="block text-sm">People who came
            <input type="number" min="1" className={field} value={form.people} onChange={set("people")} />
          </label>
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button className={`${btn} w-full`}>Save class</button>
      </form>
      <section>
        <p className="mb-4 text-sm text-stone-700">{sessions.length} classes taught, {total} people reached.</p>
        {sessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-sm text-stone-600">No classes logged yet. Save the first one using the form.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg bg-white p-3 text-sm shadow-sm">
                <span><strong>{s.topic}</strong>, {s.place}, {s.date}, {s.people} people</span>
                <button onClick={() => setSessions(sessions.filter((x) => x.id !== s.id))} className="text-red-700 hover:underline">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function Teach() {
  const [view, setView] = useState("lessons");
  const [open, setOpen] = useState(null);
  const [completed, setCompleted] = useStored("completedLessons", []);
  const complete = (id) => !completed.includes(id) && setCompleted([...completed, id]);
  const lesson = LESSONS.find((l) => l.id === open);

  return (
    <div>
      <div className="mb-6 flex gap-2 text-sm">
        {[["lessons", "Lessons"], ["log", "Class log"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} className={`rounded-full px-4 py-1.5 ${view === id ? "bg-emerald-900 text-white" : "bg-white hover:bg-stone-200"}`}>{label}</button>
        ))}
      </div>
      {view === "log" ? <ClassLog /> : lesson ? (
        <Lesson key={lesson.id} lesson={lesson} done={completed.includes(lesson.id)} onComplete={complete} onBack={() => setOpen(null)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {LESSONS.map((l) => (
            <button key={l.id} onClick={() => setOpen(l.id)} className="rounded-lg bg-white p-5 text-left shadow-sm hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
              <Pic src={l.image} alt={l.title} className="mb-3 h-32 w-full rounded-md object-cover" />
              <span className="block font-semibold">{l.title}</span>
              <span className="mt-2 block text-sm text-stone-600">{completed.includes(l.id) ? "Completed" : `${l.quiz.length} questions`}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}