import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "User Dashboard | ReliefLink",
  description: "User Dashboard for ReliefLink Platform",
};

export default function UserDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          User Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your personal dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {/* Relief Requests Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Relief Requests
            </h3>
          </div>
          <div className="text-3xl font-bold text-brand-500">12</div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Active requests
          </p>
        </div>

        {/* Donations Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Donations
            </h3>
          </div>
          <div className="text-3xl font-bold text-success-500">$1,250</div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Total contributed
          </p>
        </div>

        {/* Impact Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Impact Score
            </h3>
          </div>
          <div className="text-3xl font-bold text-orange-500">85</div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Community ranking
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                Donation to Food Relief Fund
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                2 days ago
              </p>
            </div>
            <span className="text-success-500 font-semibold">$250</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                Relief Request Submitted
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                5 days ago
              </p>
            </div>
            <span className="text-warning-500 font-semibold">Pending</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                Joined Community Program
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                1 week ago
              </p>
            </div>
            <span className="text-brand-500 font-semibold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

