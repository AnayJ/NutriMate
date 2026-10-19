import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { dashboardService } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import '../styles/WeeklyReport.css';

export default function WeeklyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const response = await dashboardService.getWeeklyReport();
      setReport(response.data);
    } catch (error) {
      console.error('Error loading weekly report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!report) {
    return <div className="flex justify-center items-center h-screen">No report available</div>;
  }

  const summary = report.summary;

  return (
    <main className={`weekly-report-page ${darkMode ? 'is-dark' : ''}`}>
      <div className="weekly-report-layout">
        <button
          onClick={() => navigate('/dashboard')}
          className="report-back flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="weekly-report-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Weekly Health Report</h1>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Days Tracked</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{summary.days_tracked}</p>
            </div>
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Calories</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                {Math.round(summary.avg_calories)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Protein</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                {Math.round(summary.avg_protein)}g
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Carbs</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">
                {Math.round(summary.avg_carbs)}g
              </p>
            </div>
          </div>

          {/* Report Text */}
          <div className={`mb-8 p-6 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI Generated Insights</h2>
            <div
              className={`whitespace-pre-line ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
              dangerouslySetInnerHTML={{ __html: report.report }}
            />
          </div>

          {/* Daily Breakdown */}
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Daily Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(summary.daily_breakdown).map(([date, totals]) => (
                <div
                  key={date}
                  className={`p-4 border rounded-lg ${darkMode ? 'border-gray-700 hover:bg-gray-900' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100 px-3 py-1 rounded text-sm font-semibold">
                      {Math.round(totals.total_calories)} cal
                    </span>
                  </div>
                  <div className={`flex gap-6 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>🥛 {Math.round(totals.total_protein)}g protein</span>
                    <span>🌾 {Math.round(totals.total_carbs)}g carbs</span>
                    <span>🧈 {Math.round(totals.total_fats)}g fats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className={`p-6 rounded-lg border ${darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
            <h3 className={`font-bold mb-2 ${darkMode ? 'text-green-200' : 'text-green-900'}`}>💡 Next Steps</h3>
            <ul className={`text-sm space-y-1 list-disc list-inside ${darkMode ? 'text-green-100' : 'text-green-800'}`}>
              <li>Continue logging meals consistently daily</li>
              <li>Aim for balanced macronutrient distribution</li>
              <li>Stay hydrated and get adequate rest</li>
              <li>Review your progress weekly to stay motivated</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
