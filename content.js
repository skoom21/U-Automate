function automateCourseSelection(electives, allConditionsMet) {
  console.log('Attempting to select courses:', electives);
  
  // Override confirmation dialogs to automatically confirm
  const originalConfirm = window.confirm;
  const originalAlert = window.alert;
  
  window.confirm = function(message) {
    console.log('Auto-confirming dialog:', message);
    return true; // Automatically return true (Yes)
  };
  
  window.alert = function(message) {
    console.log('Auto-dismissing alert:', message);
    // Alert dialogs don't need return value, just log and continue
  };
  
  const courseRows = document.querySelectorAll('#CourseRegistrationtbl tbody tr');
  let coursesFound = 0;
  let coursesSelected = 0;

  courseRows.forEach((row) => {
    const courseNameCell = row.querySelector('td[name="CourseId"]');
    if (!courseNameCell) {
      return;
    }

    const courseName = courseNameCell.textContent.trim();
    
    // Check if this course matches any of our electives
    const matchingElective = electives.find(elective => 
      courseName.toLowerCase().includes(elective.toLowerCase()) ||
      elective.toLowerCase().includes(courseName.toLowerCase())
    );
    
    if (matchingElective) {
      coursesFound++;
      console.log(`Found matching course: ${courseName} for elective: ${matchingElective}`);
      
      const sectionDropdown = row.querySelector('select.section');
      const registerCheckbox = row.querySelector('.RegisterChkbox');

      if (sectionDropdown && registerCheckbox) {
        // Select first available section
        if (sectionDropdown.options.length > 0) {
          sectionDropdown.selectedIndex = 0;
        }
        
        if (!registerCheckbox.checked) {
          registerCheckbox.checked = true;
          coursesSelected++;
          console.log(`Selected course: ${courseName}`);
        }
      } else {
        console.log(`Course ${courseName} found but no checkbox/dropdown available`);
      }
    }
  });

  console.log(`Found ${coursesFound} courses, selected ${coursesSelected} courses`);

  if (coursesSelected > 0 && allConditionsMet) {
    const registerButton = document.querySelector('#submit') || document.querySelector('.register');
    if (registerButton) {
      console.log('Clicking register button...');
      chrome.runtime.sendMessage({ action: 'stopAutomation' });
      
      // Override confirmation dialogs to automatically confirm
      const originalConfirm = window.confirm;
      const originalAlert = window.alert;
      
      window.confirm = function(message) {
        console.log('Auto-confirming dialog:', message);
        return true; // Automatically return true (Yes)
      };
      
      window.alert = function(message) {
        console.log('Auto-dismissing alert:', message);
        // Alert dialogs don't need return value, just log and continue
      };
      
      // Add a small delay before clicking to ensure all selections are processed
      setTimeout(() => {
        registerButton.click();
        
        // Restore original functions after a delay to avoid affecting other page functionality
        setTimeout(() => {
          window.confirm = originalConfirm;
          window.alert = originalAlert;
          console.log('Dialog functions restored');
        }, 3000);
      }, 500);
    } else {
      console.log('Register button not found');
      // Restore functions even if register button not found
      setTimeout(() => {
        window.confirm = originalConfirm;
        window.alert = originalAlert;
      }, 1000);
    }
  } else {
    // Restore functions if no courses selected
    setTimeout(() => {
      window.confirm = originalConfirm;
      window.alert = originalAlert;
    }, 1000);
  }
}

function checkChangesAndAutomate(electives) {
  console.log('Checking changes for electives:', electives);
  const courseRows = document.querySelectorAll('#CourseRegistrationtbl tbody tr');
  let allConditionsMet = true;
  let electivesFound = false;
  const foundCourses = [];

  courseRows.forEach((row) => {
    const courseNameCell = row.querySelector('td[name="CourseId"]');
    if (!courseNameCell) {
      return;
    }

    const courseName = courseNameCell.textContent.trim();
    
    // Use more flexible matching - check if course name contains the elective or vice versa
    const matchingElective = electives.find(elective => 
      courseName.toLowerCase().includes(elective.toLowerCase()) ||
      elective.toLowerCase().includes(courseName.toLowerCase())
    );
    
    if (matchingElective) {
      electivesFound = true;
      foundCourses.push(courseName);
      console.log(`Found course: ${courseName} for elective: ${matchingElective}`);
      
      // Check for section availability
      const sectionCell = row.cells[5]; // Section column (6th column, index 5)
      const operationsCell = row.cells[6]; // Operations column (7th column, index 6)

      if (sectionCell && operationsCell) {
        const sectionText = sectionCell.textContent.trim();
        const operationsText = operationsCell.textContent.trim();

        console.log(`Course ${courseName}: Section="${sectionText}", Operations="${operationsText}"`);

        if (sectionText.includes('No Seats Available') || 
            operationsText.includes('Sections Full') ||
            sectionText.includes('Sections Full')) {
          console.log(`Course ${courseName} is not available`);
          allConditionsMet = false;
        }
      }
    }
  });

  if (!electivesFound) {
    console.log('No matching electives found on page');
    alert("Electives not Found! Please check your course names.");
    chrome.runtime.sendMessage({ action: 'stopAutomation' });
    return;
  }

  console.log(`Found courses: ${foundCourses.join(', ')}`);
  console.log(`All conditions met: ${allConditionsMet}`);

  if (allConditionsMet && electivesFound) {
    console.log('All conditions met, attempting course selection');
    automateCourseSelection(electives, allConditionsMet);
  } else if (electivesFound) {
    console.log('Some courses not available, continuing to monitor...');
    // Continue monitoring - don't restart automation here as it's already running
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.action === 'startAutomation') {
    const { electives } = message;
    console.log('Starting initial automation check');
    automateCourseSelection(electives, true);
    sendResponse({success: true});
  }
  
  if (message.action === 'checkChanges') {
    const { electives } = message;
    console.log('Checking for changes after page reload');
    checkChangesAndAutomate(electives);
    sendResponse({success: true});
  }
  
  return true; // Keep message channel open for sendResponse
});

// Log when content script loads
console.log('Course registration content script loaded');