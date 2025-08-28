document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("electiveForm");
  const addButton = document.querySelector(".btn-add");
  const delButton = document.querySelector(".btn-remove");
  const inputContainer = document.querySelector(".input-container");
  const stopAutomation = document.querySelector(".stopAutomation");
  

  // Add event listener to the "+" button to add new input boxes
  addButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent any default behavior
    
    console.log("Current input count: " + inputContainer.childElementCount);
    
    if (inputContainer.childElementCount < 3) {
      const newInputContainer = document.createElement("div");
      newInputContainer.classList.add("form-group", "input-container");
      newInputContainer.innerHTML = `
        <label for="elective${inputContainer.childElementCount + 1}">Elective ${inputContainer.childElementCount + 1}:</label>
        <div class="input-group">
          <input type="text" class="form-control" id="elective${inputContainer.childElementCount + 1}" />
        </div>
      `;
      inputContainer.appendChild(newInputContainer);
    }
    
    // Show remove button if more than one input
    if (inputContainer.childElementCount > 1) {
      delButton.style.opacity = "100%";
      delButton.disabled = false;
    }
    
    console.log("New input count: " + inputContainer.childElementCount);
  });

  // Add event listener for remove button (use event delegation)
  delButton.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent any default behavior
    
    if (inputContainer.childElementCount > 1) {
      inputContainer.removeChild(inputContainer.lastChild);
      
      // Hide remove button if only one input left
      if (inputContainer.childElementCount === 1) {
        delButton.style.opacity = "0%";
        delButton.disabled = true;
      }
    }
  });

  // Add event listener to the form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // CRITICAL: Prevent form from submitting normally
    
    console.log("Form submitted");
    const electives = [];
    const electiveInputs = document.querySelectorAll("input[type='text']"); // Be more specific
    
    electiveInputs.forEach((input) => {
      const value = input.value.trim();
      if (value !== "") {
        console.log("Adding elective:", value);
        electives.push(value);
      }
    });
    
    console.log("All electives:", electives);
    
    if (electives.length > 0) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
          alert("No active tab found");
          return;
        }
        
        const tab = tabs[0].url;
        console.log("Current tab URL:", tab);
        
        // Check if the tab's URL matches the expected registrations page URL
        if (tab.includes("https://flexstudent.nu.edu.pk/Student/CourseRegistration")) {
          console.log("Sending start automation message");
          
          // Send message to start automation with the selected electives
          chrome.runtime.sendMessage({
            action: "startAutomation",
            electives: electives,
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
              alert("Error starting automation. Please try again.");
            } else {
              console.log("Automation started successfully");
              // Optionally close the popup
              // window.close();
            }
          });
        } else {
          alert("Please navigate to the course registration page first:\nhttps://flexstudent.nu.edu.pk/Student/CourseRegistration");
        }
      });
    } else {
      alert("Please enter at least one elective course name");
    }
  });

  // Stop automation button
  stopAutomation.addEventListener("click", function (event) {
    event.preventDefault();

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        alert("No active tab found");
        return;
      }
      
      // Send message to stop automation
      chrome.runtime.sendMessage({
        action: "stopAutomation",
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending stop message:", chrome.runtime.lastError);
        } else {
          console.log("Stop automation message sent");
          alert("Automation stopped");
        }
      });
    });
  });
});