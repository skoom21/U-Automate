function automateCourseSelection(electives, allConditionsMet) {
  const courseRows = document.querySelectorAll('#CourseRegistrationtbl tbody tr');

  courseRows.forEach((row) => {
    const courseNameCell = row.querySelector('td[name="CourseId"]');
    if (!courseNameCell) {
      return;
    }

    const courseName = courseNameCell.textContent.trim();
    for (let i = 0; i < electives.length; i++) {
      if (courseName.includes(electives[i])) {
        const sectionDropdown = row.querySelector('select.section');
        const registerCheckbox = row.querySelector('.RegisterChkbox');

        if (sectionDropdown && registerCheckbox) {
          sectionDropdown.selectedIndex = 0; // Change based on your structure
          registerCheckbox.checked = true;
        }
      }
    }
  });

  const registerButton = document.querySelector('.register');
  if (registerButton && allConditionsMet) {
    chrome.runtime.sendMessage({ action: 'stopAutomation' });
    registerButton.click();
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'startAutomation') {
    const { electives } = message;
    automateCourseSelection(electives, true);
  }
});

// Add the listener for checking changes and automating
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'checkChanges') {
    const { electives } = message;
    checkChangesAndAutomate(electives);
  }
});

function checkChangesAndAutomate(electives) {
  const courseRows = document.querySelectorAll('#CourseRegistrationtbl tbody tr');

  let allConditionsMet = true;
  let e_Found = false;

  courseRows.forEach((row) => {
    const courseNameCell = row.querySelector('td[name="CourseId"]');
    if (!courseNameCell) {
      return;
    }

    const courseName = courseNameCell.textContent.trim();
    for (let i = 0; i < electives.length; i++) {
      if (courseName === electives[i]) {
        e_Found = true;
        const sectionCell = row.querySelector('.section');
        const operationsCell = row.querySelector('.m-datatable__cell[data-field="Register"]');

        if (sectionCell && operationsCell) {
          const sectionText = sectionCell.textContent.trim();
          const operationsText = operationsCell.textContent.trim();

          if (sectionText === 'No Seats Available' || operationsText === 'Sections Full') {
            allConditionsMet = false;
          }
        }
      }
    }
  });

  if (!e_Found) {
    alert("Electives not Found!!!");
    chrome.runtime.sendMessage({ action: 'stopAutomation' });
  }

  if (allConditionsMet && e_Found) {
    automateCourseSelection(electives, allConditionsMet);
  } else if (e_Found) {
    chrome.runtime.sendMessage({ action: 'startAutomation', electives });
  }
}
