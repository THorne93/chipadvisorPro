export default function Footer() {
  return (
    <footer
      className="bg-yellow-500 text-center py-4 flex-shrink-0"
      style={{ flexShrink: 0 }}
    >
      © {new Date().getFullYear()} Chip Advisor. All rights reserved.
    </footer>
  );
}
