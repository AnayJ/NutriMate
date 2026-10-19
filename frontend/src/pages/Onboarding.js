import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/api';
import { Activity, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import '../styles/Onboarding.css';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const { updateUser } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    fitnessGoal: '',
    targetCalories: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateBMI = (weight, height) => {
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(2);
  };

  const calculateMaintenance = (weight, height, age = 30, gender = 'M') => {
    // Mifflin-St Jeor approximation used in backend (same defaults)
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || !h) return 2000;
    let bmr;
    if ((gender || 'M').toUpperCase() === 'M') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }
    return Math.round(bmr * 1.55);
  };

  const getAISuggestion = async () => {
    if (!formData.weight || !formData.height) {
      alert('Please enter weight and height');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.suggestGoal(
        parseFloat(formData.weight),
        parseFloat(formData.height)
      );
      setAiSuggestion(response.data);
      setFormData((prev) => ({
        ...prev,
        fitnessGoal: response.data.suggested_goal,
        targetCalories: response.data.target_calories,
      }));
    } catch (error) {
      alert('Failed to get AI suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!formData.weight || !formData.height) {
        alert('Please enter weight and height');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.fitnessGoal) {
        alert('Please select or get AI suggestion for a fitness goal');
        return;
      }
      setStep(3);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await userService.completeOnboarding(
        parseFloat(formData.weight),
        parseFloat(formData.height),
        formData.fitnessGoal
      );
      updateUser({
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        fitness_goal: formData.fitnessGoal,
        target_calories: parseFloat(formData.targetCalories),
      });
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`onboarding-page ${darkMode ? 'is-dark' : ''}`}>
      <div className="onboarding-layout">
        {/* Progress */}
        <div className="onboarding-progress mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Setup Your Profile</h1>
          <p className="text-gray-600">Step {step} of 3</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full ${
                  i <= step ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="onboarding-card bg-white rounded-lg shadow-xl p-8">
          {/* Step 1: Weight and Height */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-indigo-600" />
                Basic Measurements
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="70"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="175"
                    step="0.1"
                  />
                </div>
              </div>

              {formData.weight && formData.height && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>BMI: </strong>
                    {calculateBMI(formData.weight, formData.height)}
                    {calculateBMI(formData.weight, formData.height) < 18.5 && ' (Underweight)'}
                    {calculateBMI(formData.weight, formData.height) >= 18.5 && 
                      calculateBMI(formData.weight, formData.height) < 25 && ' (Normal)'}
                    {calculateBMI(formData.weight, formData.height) >= 25 && 
                      calculateBMI(formData.weight, formData.height) < 30 && ' (Overweight)'}
                    {calculateBMI(formData.weight, formData.height) >= 30 && ' (Obese)'}
                  </p>
                </div>
              )}

              <button
                onClick={handleContinue}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Fitness Goal */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="text-indigo-600" />
                Choose Your Goal
              </h2>

              <div className="space-y-3">
                {[
                  { value: 'lose', label: 'Lose Weight', icon: TrendingDown },
                  { value: 'gain', label: 'Gain Weight', icon: TrendingUp },
                  { value: 'maintain', label: 'Maintain', icon: Activity },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => {
                      const maintenance = calculateMaintenance(formData.weight, formData.height);
                      const target = value === 'lose' ? Math.round(maintenance * 0.85) : value === 'gain' ? Math.round(maintenance * 1.15) : maintenance;
                      setFormData((prev) => ({ ...prev, fitnessGoal: value, targetCalories: target }));
                    }}
                    className={`w-full p-4 rounded-lg border-2 flex items-center gap-3 transition ${
                      formData.fitnessGoal === value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <Icon size={24} className="text-indigo-600" />
                    <span className="font-semibold text-gray-700">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={getAISuggestion}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loading ? 'Getting AI Suggestion...' : 'Get AI Suggestion'}
              </button>

              {aiSuggestion && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-900 font-semibold mb-2">AI Suggestion:</p>
                  <p className="text-green-800 text-sm mb-2">{aiSuggestion.explanation}</p>
                  <p className="text-green-800 text-sm">
                    <strong>Weekly Projection:</strong> {aiSuggestion.weekly_projection}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Your Settings</h2>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-semibold text-gray-800">{formData.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Height:</span>
                  <span className="font-semibold text-gray-800">{formData.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI:</span>
                  <span className="font-semibold text-gray-800">
                    {calculateBMI(formData.weight, formData.height)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fitness Goal:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {formData.fitnessGoal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Target Calories:</span>
                  <span className="font-semibold text-gray-800">
                    {Math.round(formData.targetCalories || 0)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
