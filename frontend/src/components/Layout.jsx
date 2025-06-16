import ActivationLayerContainer from "../containers/ActivationLayerContainer";
import { Header } from "./Header";

function Layout() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header />

      {/* Main layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 p-4 border-r">
          <div className="font-semibold mb-4">Controls</div>
          {/* Add controls here */}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 overflow-auto">
          <ActivationLayerContainer />
        </main>
      </div>
    </div>
  );
}

export default Layout;
