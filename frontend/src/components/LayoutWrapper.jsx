export default function LayoutWrapper({ children }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <main>{children}</main>
    </div>
  );
}
