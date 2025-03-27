document.addEventListener("DOMContentLoaded", function () {
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentDate = document.getElementById("appointment-date");
    const numDogsInput = document.getElementById("num-dogs");
    const dogInfoContainer = document.getElementById("dog-info-container");

    // Function to dynamically update dog input fields
    function updateDogFields() {
        dogInfoContainer.innerHTML = ""; // Clear previous fields

        let numDogs = parseInt(numDogsInput.value);
        if (numDogs > 0 && numDogs <= 15) {
            for (let i = 1; i <= numDogs; i++) {
                // Dog Name
                const nameLabel = document.createElement("label");
                nameLabel.textContent = `Dog ${i} Name:`;
                nameLabel.classList.add("form-label");

                const nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.name = `dog-name-${i}`;
                nameInput.required = true;
                nameInput.classList.add("form-input");

                // Dog Breed
                const breedLabel = document.createElement("label");
                breedLabel.textContent = `Dog ${i} Breed:`;
                breedLabel.classList.add("form-label");

                const breedInput = document.createElement("input");
                breedInput.type = "text";
                breedInput.name = `dog-breed-${i}`;
                breedInput.required = true;
                breedInput.classList.add("form-input");

                // Dog Size
                const sizeLabel = document.createElement("label");
                sizeLabel.textContent = `Dog ${i} Size:`;
                sizeLabel.classList.add("form-label");

                const sizeSelect = document.createElement("select");
                sizeSelect.name = `dog-size-${i}`;
                sizeSelect.required = true;
                sizeSelect.classList.add("form-select");

                ["small", "medium", "large"].forEach(size => {
                    const option = document.createElement("option");
                    option.value = size;
                    option.textContent = size.charAt(0).toUpperCase() + size.slice(1);
                    sizeSelect.appendChild(option);
                });

                // Append to form
                dogInfoContainer.appendChild(nameLabel);
                dogInfoContainer.appendChild(nameInput);
                dogInfoContainer.appendChild(breedLabel);
                dogInfoContainer.appendChild(breedInput);
                dogInfoContainer.appendChild(sizeLabel);
                dogInfoContainer.appendChild(sizeSelect);
            }
        }
    }

    // Update dog fields when number changes
    numDogsInput.addEventListener("input", updateDogFields);

    // Form submission logic
    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const customerName = document.getElementById("customer-name").value.trim();
        const phoneNumber = document.getElementById("phone-number").value.trim();
        const selectedDate = appointmentDate.value;
        const numDogs = parseInt(numDogsInput.value);

        if (!customerName || !phoneNumber || !selectedDate || numDogs <= 0) {
            alert("Please fill out all required fields.");
            return;
        }

        let dogNames = [], dogBreeds = [], dogSizes = [];

        for (let i = 1; i <= numDogs; i++) {
            const name = document.getElementsByName(`dog-name-${i}`)[0].value.trim();
            const breed = document.getElementsByName(`dog-breed-${i}`)[0].value.trim();
            const size = document.getElementsByName(`dog-size-${i}`)[0].value;

            if (!name || !breed || !size) {
                alert(`Please fill out all details for Dog ${i}.`);
                return;
            }

            dogNames.push(name);
            dogBreeds.push(breed);
            dogSizes.push(size);
        }

        // Send data to Google Apps Script
        fetch("https://script.google.com/macros/s/AKfycbwD0D57Iqzvb5vCz6BJ4jzHeRKqAkcEt64LtgU_-NjXLDyRGM6aQAtYqbHLivnqnu5Ztw/exec", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: customerName,
                phone: phoneNumber,
                date: selectedDate,
                numDogs: numDogs,
                dogNames: dogNames,
                dogBreeds: dogBreeds,
                dogSizes: dogSizes
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.result === "success") {
                appointmentForm.innerHTML = `<p>✅ Thank you, ${customerName}! Your appointment for ${numDogs} dog(s) on ${selectedDate} has been submitted.</p>`;
            } else {
                alert("Something went wrong. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("There was a problem submitting your appointment.");
        });
    });
});