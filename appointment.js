document.addEventListener("DOMContentLoaded", function () {
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentDate = document.getElementById("appointment-date");
    const numDogsInput = document.getElementById("num-dogs");
    const dogInfoContainer = document.getElementById("dog-info-container"); // Ensure this exists in HTML

    // Function to dynamically update dog input fields
    function updateDogFields() {
        dogInfoContainer.innerHTML = ""; // Clear previous entries

        let numDogs = parseInt(numDogsInput.value);
        if (numDogs > 0 && numDogs <= 15) {
            for (let i = 1; i <= numDogs; i++) {
                // Create Dog Name Input
                let nameLabel = document.createElement("label");
                nameLabel.textContent = `Dog ${i} Name:`;
                nameLabel.classList.add("form-label");
                let nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.name = `dog-name-${i}`;
                nameInput.required = true;
                nameInput.classList.add("form-input");

                // Create Dog Breed Input
                let breedLabel = document.createElement("label");
                breedLabel.textContent = `Dog ${i} Breed:`;
                breedLabel.classList.add("form-label");
                let breedInput = document.createElement("input");
                breedInput.type = "text";
                breedInput.name = `dog-breed-${i}`;
                breedInput.required = true;
                breedInput.classList.add("form-input");

                // Create Dog Size Select
                let sizeLabel = document.createElement("label");
                sizeLabel.textContent = `Dog ${i} Size:`;
                sizeLabel.classList.add("form-label");
                let sizeSelect = document.createElement("select");
                sizeSelect.name = `dog-size-${i}`;
                sizeSelect.required = true;
                sizeSelect.classList.add("form-select");

                let sizes = ["small", "medium", "large"];
                sizes.forEach(size => {
                    let option = document.createElement("option");
                    option.value = size;
                    option.textContent = size.charAt(0).toUpperCase() + size.slice(1);
                    sizeSelect.appendChild(option);
                });

                // Append all fields to container
                dogInfoContainer.appendChild(nameLabel);
                dogInfoContainer.appendChild(nameInput);
                dogInfoContainer.appendChild(breedLabel);
                dogInfoContainer.appendChild(breedInput);
                dogInfoContainer.appendChild(sizeLabel);
                dogInfoContainer.appendChild(sizeSelect);
            }
        }
    }

    // Update fields when number of dogs changes
    numDogsInput.addEventListener("input", updateDogFields);

    // 🚀 Removed pop-up alert for date selection, as per request

    // Form submission logic
    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let customerName = document.getElementById("customer-name").value;
        let phoneNumber = document.getElementById("phone-number").value;
        let selectedDate = appointmentDate.value;
        let numDogs = parseInt(numDogsInput.value);

        // Collect dog information dynamically
        let dogs = [];
        for (let i = 1; i <= numDogs; i++) {
            let dogName = document.getElementsByName(`dog-name-${i}`)[0].value;
            let dogBreed = document.getElementsByName(`dog-breed-${i}`)[0].value;
            let dogSize = document.getElementsByName(`dog-size-${i}`)[0].value;

            if (!dogName || !dogBreed || !dogSize) {
                alert("Please fill out all dog details.");
                return;
            }

            dogs.push({ name: dogName, breed: dogBreed, size: dogSize });
        }

        // Ensure all required fields are filled
        if (!customerName || !phoneNumber || !selectedDate || numDogs <= 0) {
            alert("Please fill out all required fields.");
            return;
        }

        // Store submission status in localStorage (temporary until backend setup)
        localStorage.setItem("appointmentSubmitted", "true");

        // Show confirmation message
        appointmentForm.innerHTML = `<p>✅ Thank you, ${customerName}! Your appointment for ${numDogs} dog(s) on ${selectedDate} has been submitted.</p>`;
    });
}); 