import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { mealService } from '../services/api';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import '../styles/MealEntry.css';

const numberInputStyle = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

export default function MealEntry() {
  const nextMealId = useRef(Date.now());

  const getNewMeal = () => ({
    id: nextMealId.current++,
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  const [meals, setMeals] = useState([getNewMeal()]);
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const handleMealChange = (id, field, value) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === id ? { ...meal, [field]: value } : meal
      )
    );
  };

  const addMealForm = () => {
    setMeals((prev) => [...prev, getNewMeal()]);
  };

  const removeMealForm = (id) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      for (const meal of meals) {
        if (meal.name) {
          await mealService.createMeal(
            meal.name,
            meal.description,
            parseFloat(meal.calories),
            parseFloat(meal.protein),
            parseFloat(meal.carbs),
            parseFloat(meal.fats)
          );
        }
      }
      navigate('/dashboard');
    } catch (error) {
      alert('Error saving meals');
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + (parseFloat(meal.calories) || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (parseFloat(meal.protein) || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (parseFloat(meal.carbs) || 0), 0);
  const totalFats = meals.reduce((sum, meal) => sum + (parseFloat(meal.fats) || 0), 0);

  return (
    <main className={`meal-entry-page ${darkMode ? 'is-dark' : ''}`}>
      <style>{numberInputStyle}</style>
      <div className="meal-entry-layout">
        <button
          onClick={() => navigate('/dashboard')}
          className="meal-entry-back flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="meal-entry-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Log Your Meals</h1>

          <form onSubmit={handleSubmit}>
            {meals.map((meal, index) => (
              <div key={meal.id} className="meal-entry-item mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Meal {index + 1}</h3>
                  {meals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMealForm(meal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meal Name *
                    </label>
                    <input
                      type="text"
                      value={meal.name}
                      onChange={(e) =>
                        handleMealChange(meal.id, 'name', e.target.value)
                      }
                      placeholder="e.g., Chicken and Rice"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={meal.description}
                      onChange={(e) =>
                        handleMealChange(meal.id, 'description', e.target.value)
                      }
                      placeholder="e.g., Grilled chicken with brown rice and vegetables"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Calories *
                      </label>
                      <input
                        type="number"
                        value={meal.calories}
                        onChange={(e) =>
                          handleMealChange(
                            meal.id,
                            'calories',
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        step="0.1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Protein (g) *
                      </label>
                      <input
                        type="number"
                        value={meal.protein}
                        onChange={(e) =>
                          handleMealChange(
                            meal.id,
                            'protein',
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        step="0.1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Carbs (g) *
                      </label>
                      <input
                        type="number"
                        value={meal.carbs}
                        onChange={(e) =>
                          handleMealChange(
                            meal.id,
                            'carbs',
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        step="0.1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fats (g) *
                      </label>
                      <input
                        type="number"
                        value={meal.fats}
                        onChange={(e) =>
                          handleMealChange(
                            meal.id,
                            'fats',
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="meal-entry-totals p-4 bg-gray-100 dark:bg-gray-900 rounded-lg mb-6">
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Daily Total</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Calories</p>
                  <p className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {Math.round(totalCalories)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Protein</p>
                  <p className="text-lg font-bold text-green-600">
                    {Math.round(totalProtein)}g
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Carbs</p>
                  <p className="text-lg font-bold text-amber-600">
                    {Math.round(totalCarbs)}g
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300">Fats</p>
                  <p className="text-lg font-bold text-red-600">
                    {Math.round(totalFats)}g
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={addMealForm}
                className="meal-entry-add flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold"
              >
                <Plus size={20} />
                Add Another Meal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="meal-entry-save flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Meals'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
