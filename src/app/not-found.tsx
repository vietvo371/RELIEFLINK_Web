import Link from "next/link";
import React from "react";

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg px-4 text-center">
        <h1 className="mb-4 text-6xl font-bold text-brand-500">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/master-admin"
            className="rounded-lg bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600"
          >
            Go to Master Admin
          </Link>
          <Link
            href="/user"
            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Go to User Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

