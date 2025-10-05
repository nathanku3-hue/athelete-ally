// scripts/generate-task.js

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// Get the ticket ID from the command line (e.g., "node generate-task.js ATH-001")
const ticketId = process.argv[2];

if (!ticketId) {
  console.error('Error: Please provide a ticket ID.');
  process.exit(1);
}

try {
  // 1. READ the human-friendly PRD file
  const prdPath = path.join(__dirname, '..', 'features.yaml');
  const prdFile = fs.readFileSync(prdPath, 'utf8');
  const prdData = yaml.load(prdFile);

  // 2. FIND the specific feature by its ticket ID
  // This assumes your YAML is a list under a key, e.g., 'epics' or directly a list
  // We'll flatten all user stories from all epics to find the one we want.
  const allUserStories = prdData.flatMap(epic => epic.user_stories || []);
  const feature = allUserStories.find(story => story.ticket_id === ticketId);

  if (!feature) {
    throw new Error(`Feature with ticket ID "${ticketId}" not found in features.yaml.`);
  }

  // 3. EXTRACT and structure the data for the AI
  const task = {
    action: 'create_page', // This could be determined more intelligently
    ticketId: feature.ticket_id,
    featureName: feature.feature_name,
    userStory: feature.user_story,
    acceptanceCriteria: feature.acceptance_criteria,
    // Add any other relevant data the AI might need, like a route
    route: feature.route || null
  };

  // 4. WRITE the machine-readable JSON task file
  const outputDir = path.join(__dirname, '..', 'features', ticketId);
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'task.json');
  fs.writeFileSync(outputPath, JSON.stringify(task, null, 2));

  console.log(`✅ Successfully created task file at: ${outputPath}`);

} catch (e) {
  console.error('Error processing PRD:', e.message);
}