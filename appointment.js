document.addEventListener("DOMContentLoaded", function () {
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentDate = document.getElementById("appointment-date");
    const numDogsInput = document.getElementById("num-dogs");
    const dogInfoContainer = document.getElementById("dog-info-container");

    function updateDogFields() {
        dogInfoContainer.innerHTML = "";
        const numDogs = parseInt(numDogsInput.value);
        if (numDogs > 0 && numDogs <= 15) {
            for (let i = 1; i <= numDogs; i++) {
                let nameLabel = document.createElement("label");
                nameLabel.textContent = `Dog ${i} Name:`;
                let nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.name = `dog-name-${i}`;
                nameInput.required = true;

                let breedLabel = document.createElement("label");
                breedLabel.textContent = `Dog ${i} Breed:`;
                let breedInput = document.createElement("input");
                breedInput.type = "text";
                breedInput.name = `dog-breed-${i}`;
                breedInput.required = true;

                let sizeLabel = document.createElement("label");
                sizeLabel.textContent = `Dog ${i} Size:`;
                let sizeSelect = document.createElement("select");
                sizeSelect.name = `dog-size-${i}`;
                sizeSelect.required = true;
                ["small", "medium", "large"].forEach(size => {
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

        const name = document.getElementById("customer-name").value;
        const phone = document.getElementById("phone-number").value;
        const date = appointmentDate.value;
        const numDogs = parseInt(numDogsInput.value);

        const dogs = [];
        for (let i = 1; i <= numDogs; i++) {
            const dogName = document.getElementsByName(`dog-name-${i}`)[0].value;
            const dogBreed = document.getElementsByName(`dog-breed-${i}`)[0].value;
            const dogSize = document.getElementsByName(`dog-size-${i}`)[0].value;

            if (!dogName || !dogBreed || !dogSize) {
                alert("Please complete all dog fields.");
                return;
            }

            dogs.push({ name: dogName, breed: dogBreed, size: dogSize });
        }

        fetch("https://script.google.com/macros/s/AKfycbxjE3Mu2fMbD1ixkeg5gy1RfvL0WX6PATyxYkz0zeXEeP5Ph3zbvfz0XjteBqI_mCRS/exec", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name, phone, date, dogs
            })
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === "success") {
                    appointmentForm.innerHTML = `<p>✅ Appointment booked successfully for ${date}. Thank you!</p>`;
                } else {
                    alert("❌ " + result.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert("There was a problem submitting your appointment. Please try again.");
            });
    });
}); 