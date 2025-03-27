document.addEventListener("DOMContentLoaded", function () {
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentDate = document.getElementById("appointment-date");
    const numDogsInput = document.getElementById("num-dogs");
    const dogInfoContainer = document.getElementById("dog-info-container");

    function updateDogFields() {
        dogInfoContainer.innerHTML = "";

        let numDogs = parseInt(numDogsInput.value);
        if (numDogs > 0 && numDogs <= 15) {
            for (let i = 1; i <= numDogs; i++) {
                let nameLabel = document.createElement("label");
                nameLabel.textContent = `Dog ${i} Name:`;
                nameLabel.classList.add("form-label");
                let nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.name = `dog-name-${i}`;
                nameInput.required = true;
                nameInput.classList.add("form-input");

                let breedLabel = document.createElement("label");
                breedLabel.textContent = `Dog ${i} Breed:`;
                breedLabel.classList.add("form-label");
                let breedInput = document.createElement("input");
                breedInput.type = "text";
                breedInput.name = `dog-breed-${i}`;
                breedInput.required = true;
                breedInput.classList.add("form-input");

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

                dogInfoContainer.appendChild(nameLabel);
                dogInfoContainer.appendChild(nameInput);
                dogInfoContainer.appendChild(breedLabel);
                dogInfoContainer.appendChild(breedInput);
                dogInfoContainer.appendChild(sizeLabel);
                dogInfoContainer.appendChild(sizeSelect);
            }
        }
    }

    numDogsInput.addEventListener("input", updateDogFields);

    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let customerName = document.getElementById("customer-name").value;
        let phoneNumber = document.getElementById("phone-number").value;
        let selectedDate = appointmentDate.value;
        let numDogs = parseInt(numDogsInput.value);

        let dogNames = [];
        let dogBreeds = [];
        let dogSizes = [];

        for (let i = 1; i <= numDogs; i++) {
            dogNames.push(document.getElementsByName(`dog-name-${i}`)[0].value);
            dogBreeds.push(document.getElementsByName(`dog-breed-${i}`)[0].value);
            dogSizes.push(document.getElementsByName(`dog-size-${i}`)[0].value);
        }

        if (!customerName || !phoneNumber || !selectedDate || numDogs <= 0) {
            alert("Please fill out all required fields.");
            return;
        }

        fetch("https://script.google.com/macros/s/AKfycbwD0D57Iqzvb5vCz6BJ4jzHeRKqAkcEt64LtgU_-NjXLDyRGM6aQAtYqbHLivnqnu5Ztw/exec", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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
        .then(data => {
            if (data.result === "success") {
                appointmentForm.innerHTML = `<p>✅ Thank you, ${customerName}! Your appointment for ${numDogs} dog(s) on ${selectedDate} has been submitted.</p>`;
            } else {
                throw new Error("Submission failed.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("There was a problem submitting your appointment. Please try again.");
        });
    });
});