import WhatsAppButton from "./WhatsAppButton";

export default function ServiceRow({ service, whatsappNumber }) {
  return (
    <div className="service-row">
      <div>
        <h3 style={{ fontSize: "1rem", marginBottom: 2 }}>{service.name}</h3>
        {service.description && <p className="small muted">{service.description}</p>}
        <p className="price" style={{ fontSize: "0.95rem" }}>
          {Number(service.price).toLocaleString("sw-TZ")} TZS
        </p>
      </div>
      <WhatsAppButton number={whatsappNumber} itemName={service.name} />
    </div>
  );
}
