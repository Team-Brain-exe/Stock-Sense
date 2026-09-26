import Icon from "./Icon";
import { Button, Text } from "./ui";

export default function LowStockToast({ alerts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="assertive">
      {alerts.map((alert) => (
        <aside className="stock-toast" key={alert.id}>
          <div className="toast-signal"><span /><span /><span /></div>
          <div className="toast-head">
            <span className="alert-icon"><Icon name="alert" size={20} /></span>
            <div>
              <Text className="toast-kicker">LIVE STOCK SIGNAL</Text>
              <Text as="h2">Reorder threshold breached</Text>
            </div>
            <Button className="toast-close" aria-label="Dismiss alert" onClick={() => onDismiss(alert.id)}><Icon name="close" size={17} /></Button>
          </div>
          <div className="toast-body">
            <Text className="toast-product">{alert.product}</Text>
            <Text className="toast-sku">{alert.sku} · {alert.location}</Text>
            <div className="stock-reading">
              <div><Text>ON HAND</Text><b>{alert.stock}</b></div>
              <span className="reading-arrow"><Icon name="arrowRight" size={18} /></span>
              <div><Text>REORDER AT</Text><b>{alert.threshold}</b></div>
              <span className="critical-tag">CRITICAL</span>
            </div>
          </div>
          <div className="toast-foot">
            <span><span className="live-dot" /> RECEIVED JUST NOW</span>
            <Button onClick={() => onDismiss(alert.id)}>Acknowledge <Icon name="arrowRight" size={14} /></Button>
          </div>
        </aside>
      ))}
    </div>
  );
}
