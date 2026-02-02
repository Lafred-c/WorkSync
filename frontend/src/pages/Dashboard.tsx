import Dashcard from "../components/ui/Dashcard";
import AcquisitionChart from "../components/charts/AcquisitionChart";
import {Card} from "../components/ui/Card";

const Dashboard = () => {
  return (
    <main className="flex flex-col p-6">
      <header className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here's what's happening with your tasks.
        </p>
      </header>
      <Dashcard />
      <div className="mt-6 flex flex-row gap-3">
        <div className="flex-1">
          <AcquisitionChart />
        </div>
        <div className="flex-1">
          <Card />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
