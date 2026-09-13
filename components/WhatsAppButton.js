export default function WhatsAppButton({ number, itemName, className = "btn btn-whatsapp btn-sm" }) {
  if (!number) return null;
  const message = itemName
    ? `Habari, nataka kuuliza kuhusu ${itemName}`
    : "Habari, nataka kuuliza kuhusu bidhaa/huduma zenu";
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      WhatsApp
    </a>
  );
}
