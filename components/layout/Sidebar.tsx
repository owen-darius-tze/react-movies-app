import MainNav from './MainNav';

export default function Sidebar() {
  return (
    <aside className="border-b border-slate-800 bg-slate-900">
      <div className="container mx-auto flex items-center justify-between p-4">
        <span className="text-xl font-extrabold text-white">MovieDB</span>
        <MainNav />
      </div>
    </aside>
  );
}