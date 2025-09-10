// Debug script to test onboarding data flow
// Run this in browser console to check data

console.log('=== Onboarding Data Debug ===');

// Check localStorage
const storedData = localStorage.getItem('onboardingData');
console.log('LocalStorage data:', storedData);

if (storedData) {
  try {
    const parsed = JSON.parse(storedData);
    console.log('Parsed data:', parsed);
    console.log('Has purpose?', !!parsed.purpose);
    console.log('Has proficiency?', !!parsed.proficiency);
    console.log('Has season?', !!parsed.season);
    console.log('Has availabilityDays?', !!parsed.availabilityDays);
    console.log('Has equipment?', !!parsed.equipment);
  } catch (error) {
    console.error('Error parsing localStorage data:', error);
  }
} else {
  console.log('No data found in localStorage');
}

// Test data structure
const testData = {
  userId: 'test_user_123',
  currentStep: 5,
  isCompleted: false,
  purpose: 'general_fitness',
  proficiency: 'intermediate',
  season: 'offseason',
  availabilityDays: ['Monday', 'Wednesday', 'Friday'],
  weeklyGoalDays: 3,
  equipment: ['yogaMat', 'dumbbells']
};

console.log('Test data structure:', testData);

// Function to set test data
window.setTestOnboardingData = () => {
  localStorage.setItem('onboardingData', JSON.stringify(testData));
  console.log('Test data set in localStorage');
  location.reload();
};

// Function to clear data
window.clearOnboardingData = () => {
  localStorage.removeItem('onboardingData');
  console.log('Onboarding data cleared');
  location.reload();
};

console.log('Available functions:');
console.log('- setTestOnboardingData() - Set test data');
console.log('- clearOnboardingData() - Clear all data');
