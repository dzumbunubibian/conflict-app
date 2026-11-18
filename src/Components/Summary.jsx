import useStored from "../useStored";

export default function Summary() {
  const [incidents] = useStored("incidents", []);
  const [conflicts] = useStored("conflicts", []);

  const openIncidents = incidents.filter((i) => i.status !== "Resolved");
  const activeConflicts = conflicts.filter((c) => c.status !== "Resolved");

  function exportData() {
    const data = JSON.stringify({ incidents, conflicts }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wildlife-records-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2>Overview</h2>

      <ul>
        <li>
          <strong>Total Incidents:</strong> {incidents.length} ({openIncidents.length} open)
        </li>
        <li>
          <strong>Total Conflicts:</strong> {conflicts.length} ({activeConflicts.length} active or mediating)
        </li>
      </ul>

      <h3>Open Incidents by Severity</h3>
      {openIncidents.length === 0 ? (
        <p>No open incidents.</p>
      ) : (
        <p>
          {["High", "Medium", "Low"]
            .map(
              (sev) =>
                `${sev}: ${openIncidents.filter((i) => i.severity === sev).length}`
            )
            .join(" | ")}
        </p>
      )}

      <h3>Unresolved Conflicts by Escalation</h3>
      {activeConflicts.length === 0 ? (
        <p>No unresolved conflicts.</p>
      ) : (
        <p>
          {["Critical", "High", "Medium", "Low"]
            .map(
              (sev) =>
                `${sev}: ${activeConflicts.filter((c) => c.severity === sev).length}`
            )
            .join(" | ")}
        </p>
      )}

      <hr />

      <div>
        <button onClick={exportData}>Download backup (JSON)</button>
      </div>
    </div>
  );
}
