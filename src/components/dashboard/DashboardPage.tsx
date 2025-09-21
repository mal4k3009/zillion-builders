import { DashboardCards } from './DashboardCards';
import { ActivityFeed } from './ActivityFeed';
import { TaskChart } from './TaskChart';
import { RecentTasks } from './RecentTasks';
import { ApprovalSection } from './ApprovalSection';

export function DashboardPage() {
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      
      {/* Approval Section for Admin Users */}
      <ApprovalSection />
      
      <DashboardCards />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="xl:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
          <TaskChart />
          <RecentTasks />
        </div>
        <div className="xl:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}