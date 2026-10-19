import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dashboardService, mealService, aiService } from '../services/api';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { TrendingDown, Trash2 } from 'lucide-react';
import '../styles/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatSuggestedAction, setChatSuggestedAction] = useState(null);
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getSummary();
      setDashboard(response.data);
      if (response.data.prediction) {
        setPrediction(response.data.prediction);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newHistory = [...chatHistory, { role: 'user', content: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');

    try {
      const response = await aiService.chat(chatMessage, newHistory);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.response },
      ]);
      setChatSuggestedAction(response.data.suggested_action || null);
    } catch (error) {
      console.error('Error sending chat:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      await mealService.deleteMeal(mealId);
      await loadDashboard();
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Failed to delete meal');
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!dashboard) {
    return <div className="flex justify-center items-center h-screen">No data available</div>;
  }

  const macroData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        data: [dashboard.protein, dashboard.carbs, dashboard.fats],
        backgroundColor: ['#014baa', '#361c0d', '#99897f'],
        borderColor: ['#f8f3f0', '#f8f3f0', '#f8f3f0'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <main className={`dashboard-page ${darkMode ? 'is-dark' : ''}`}>
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <h1>Hello {user?.name || 'User'}</h1>
          <div className="dashboard-header-actions">
            <button
              onClick={toggleDarkMode}
              className="dashboard-action dashboard-theme-action"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              <img src="/images/dashboard-theme.svg" alt="" aria-hidden="true" />
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              onClick={() => navigate('/weekly-report')}
              className="dashboard-action dashboard-report-action"
            >
              <img src="/images/dashboard-report.svg" alt="" aria-hidden="true" />
              Weekly Report
            </button>
            <button
              onClick={handleLogout}
              className="dashboard-action dashboard-logout-action"
            >
              <img src="/images/dashboard-logout.svg" alt="" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-main">
        <div className="dashboard-grid">
          <div className="dashboard-left">
            <section className="dashboard-panel dashboard-progress-panel">
              <h2>Today's Progress</h2>
              <div className="dashboard-calorie-summary">
                <img src="/images/dashboard-meal.svg" alt="" aria-hidden="true" />
                <p className="dashboard-calorie-count">
                  {Math.round(dashboard.consumed_calories)} / {Math.round(dashboard.target_calories)} Kcals
                </p>
                {dashboard.remaining_calories > 0 && (
                  <p className="dashboard-calorie-remaining">
                    {Math.round(dashboard.remaining_calories)} Kcals remaining
                  </p>
                )}
                {dashboard.exceeded && (
                  <p className="dashboard-calorie-exceeded">
                    <TrendingDown size={18} />
                    Exceeded by {Math.round(dashboard.consumed_calories - dashboard.target_calories)} calories
                  </p>
                )}
                <div
                  className={`dashboard-prediction ${
                    prediction?.will_exceed ? 'is-exceeded' : ''
                  }`}
                >
                  {prediction ? (
                    <>
                      <strong>
                        {prediction.will_exceed ? 'Over target' : 'On Track!'}
                      </strong>
                      <span>{Math.round(prediction.confidence)}% confidence</span>
                      <span className="dashboard-prediction-detail">
                        Projected total: {Math.round(prediction.projected_total)} Kcals
                      </span>
                    </>
                  ) : (
                    <strong>
                      {dashboard.exceeded ? 'Over target' : 'Keep tracking your meals'}
                    </strong>
                  )}
                </div>
                <span
                  className="dashboard-progress-accessible"
                  role="progressbar"
                  aria-label="Daily calorie target"
                  aria-valuenow={Math.round(dashboard.consumed_calories)}
                  aria-valuemin="0"
                  aria-valuemax={Math.round(dashboard.target_calories)}
                />
              </div>
            </section>

            <section className="dashboard-panel dashboard-macros-panel">
              <h2>Macro Breakdown</h2>
              <div className="dashboard-chart-slot">
                {dashboard.protein + dashboard.carbs + dashboard.fats > 0 ? (
                  <Pie
                    data={macroData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                ) : (
                  <img src="/images/dashboard-chart.png" alt="Macro ratio chart" />
                )}
              </div>
              <div className="dashboard-macro-legend">
                <div className="dashboard-macro-tile dashboard-protein-tile">
                  <span>Protein</span>
                  <strong>{Math.round(dashboard.protein)}g</strong>
                </div>
                <div className="dashboard-macro-tile dashboard-carbs-tile">
                  <span>Carbohydrates</span>
                  <strong>{Math.round(dashboard.carbs)}g</strong>
                </div>
                <div className="dashboard-macro-tile dashboard-fats-tile">
                  <img src="/images/dashboard-macro-card.svg" alt="" aria-hidden="true" />
                  <span>Fats</span>
                  <strong>{Math.round(dashboard.fats)}g</strong>
                </div>
              </div>
            </section>

            <section className="dashboard-panel dashboard-meals-panel">
              <div className="dashboard-meals-heading">
                <h2>Today's Meals ({dashboard.meal_count})</h2>
                <button
                  onClick={() => navigate('/meal-entry')}
                  className="dashboard-add-meal"
                >
                  Add Meal
                  <span className="dashboard-plus-icon" aria-hidden="true">
                    <img src="/images/dashboard-send-line.svg" alt="" />
                    <img src="/images/dashboard-send-line-alt.svg" alt="" />
                  </span>
                </button>
              </div>

              {dashboard.meals.length === 0 ? (
                <p className="dashboard-empty-meals">No meals logged yet</p>
              ) : (
                <div className="space-y-3">
                  {dashboard.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className={`p-4 rounded-lg ${
                        darkMode
                          ? 'border border-gray-700 hover:bg-gray-700'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{meal.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-semibold">
                            {Math.round(meal.calories)} cal
                          </span>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="text-red-600 hover:text-red-700 transition p-1"
                            title="Delete meal"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {meal.description && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{meal.description}</p>
                      )}
                      <div className={`flex gap-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>🥛 {meal.protein}g protein</span>
                        <span>🌾 {meal.carbs}g carbs</span>
                        <span>🧈 {meal.fats}g fats</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="dashboard-chat-cell">
            <div className="dashboard-chat-panel">
              <div className="dashboard-chat-title">
                <h2>Ask NutriAI</h2>
              </div>
              <div className="dashboard-chat-content">
                <p className="dashboard-chat-intro">
                  You can ask NutriAI to suggest daily calories and macros, other health advice!
                </p>
                <div className={`dashboard-chat-messages ${darkMode ? 'is-dark' : ''}`}>
                {chatSuggestedAction && (
                  <div className={`rounded-lg p-2 text-sm font-medium ${darkMode ? 'bg-indigo-700 text-indigo-100' : 'bg-indigo-100 text-indigo-900'}`}>
                    {chatSuggestedAction}
                  </div>
                )}
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-100 text-indigo-900 ml-4'
                        : darkMode ? 'bg-gray-700 text-gray-100 mr-4' : 'bg-gray-200 text-gray-900 mr-4'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                </div>

              <form onSubmit={handleSendChat} className="dashboard-chat-form">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message"
                  aria-label="Message NutriAI"
                />
                <button type="submit">
                  Send
                  <img src="/images/dashboard-send.svg" alt="" aria-hidden="true" />
                </button>
              </form>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
