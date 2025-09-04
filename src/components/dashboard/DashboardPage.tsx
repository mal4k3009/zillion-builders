import React from 'react';
import { DashboardCards } from './DashboardCards';
import { ActivityFeed } from './ActivityFeed';
import { TaskChart } from './TaskChart';
import { RecentTasks } from './RecentTasks';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard
      </h1>
      
      <DashboardCards />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <TaskChart />
          <RecentTasks />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}