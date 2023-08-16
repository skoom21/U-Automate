document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("electiveForm");
  const addButton = document.querySelector(".btn-add");
  const delButton = document.querySelector(".btn-remove");
  const inputContainer = document.querySelector(".input-container");
  const stopAutomation = document.querySelector(".stopAutomation");
  

  // Add event listener to the "+" button to add new input boxes
  addButton.addEventListener("click", function () {
    console.log("Print: "+inputContainer.childElementCount);
    if (inputContainer.childElementCount < 3) {
      const newInputContainer = document.createElement("div");
      newInputContainer.classList.add("form-group", "input-container");
      newInputContainer.innerHTML = `
        <label for="elective${inputContainer.childElementCount + 1}">Elective ${
        inputContainer.childElementCount + 1
      }:</label>
        <div class="input-group">
          <input type="text" class="form-control" id="elective${inputContainer.childElementCount + 1}" />
        </div>
      `;
      inputContainer.appendChild(newInputContainer);
    }
    //if input container size greater than one then change the oppacity of the btn with the class= btn remove to 100
    if (inputContainer.childElementCount > 1) {
      //make it a transition
      delButton.style.opacity = "100%";
      // and enable it
      delButton.disabled = false;
      //now listen for it to be clicked if clicked it deletes 1 element from the input-container
      delButton.addEventListener("click", function () {
        inputContainer.removeChild(inputContainer.lastChild);
        //if input container size is 1 then change the oppacity of the btn with the class= btn remove to 0
        if (inputContainer.childElementCount == 1) {
          //make it a transition
          delButton.style.opacity = "0%";
          // and disable it
          delButton.disabled = true;
        }
      });
    }
    console.log("Print"+inputContainer.childElementCount);
  });

  // Add event listener to the form submission
  form.addEventListener("submit", function (event) {
    console.log("in submit: " )
    const electives = [];
    const electiveInputs = document.querySelectorAll("input");
    electiveInputs.forEach((input) => {
      if (input.value.trim() !== "") {
        console.log(input.value.trim());
        electives.push(input.value.trim());
      }
    });
    console.log(electives);
    if (electives.length > 0) {
      console.log("mmmmmmmmmmmmm")
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0].url;
        // Check if the tab's URL matches the expected registrations page URL
        if (tab.includes("https://flexstudent.nu.edu.pk/Student/CourseRegistration")) {
          // Send message to start automation with the selected electives
          chrome.runtime.sendMessage({
            action: "startAutomation",
            electives: electives,
          });
        } else {
          alert("Please go to the registrations page");
        }
      });
    }
    else{
      alert("Please enter at least one elective");
    }
  });

  stopAutomation.addEventListener("click", function (event) {
    event.preventDefault();

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
        // Send message to stop automation with the selected electives
        chrome.runtime.sendMessage({
          action: "stopAutomation",
        });
    });
    
  });
});
