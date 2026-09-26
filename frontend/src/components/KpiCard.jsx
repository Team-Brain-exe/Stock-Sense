import Icon from "./Icon";
import { Text } from "./ui";

export default function KpiCard({ label, value, icon, colorState = "neutral", delta, detail }) {
  return (
    <article className={`kpi-card kpi-${colorState}`}>
      <div className="kpi-top">
        <span className="kpi-icon"><Icon name={icon} size={19} /></span>
        <span className="kpi-index">/0{icon.length}</span>
      </div>
      <Text className="kpi-value">{value}</Text>
      <Text className="kpi-label">{label}</Text>
      <div className="kpi-meta">
        <span className={`kpi-delta ${colorState === "danger" ? "danger" : "positive"}`}>{delta}</span>
        <span>{detail}</span>
      </div>
    </article>
  );
}
