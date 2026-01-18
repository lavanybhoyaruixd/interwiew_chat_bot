import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/smart-questions', label: 'Smart Question Generation' },
  { path: '/instant-feedback', label: 'Instant Feedback' },
  { path: '/real-time-analysis', label: 'Real-Time Analysis' },
];

export default function FeatureNavigation() {
  return (
    <nav className="w-full flex justify-center py-6 bg-white border-b border-gray-100 mb-8">
      <ul className="flex flex-wrap gap-4">
        {navItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded font-semibold hover:bg-indigo-50 transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-white text-indigo-700 border border-indigo-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

