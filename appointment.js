document.addEventListener("DOMContentLoaded", function () {
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentDate = document.getElementById("appointment-date");
    const numDogsInput = document.getElementById("num-dogs");
    const breedContainer = document.getElementById("breed-container");

    // Function to dynamically update breed input fields
    function updateBreedFields() {
        // Clear previous breed inputs
        breedContainer.innerHTML = "";

        let numDogs = parseInt(numDogsInput.value);

        if (numDogs > 0 && numDogs <= 15) {
            for (let i = 1; i <= numDogs; i++) {
                let label = document.createElement("label");
                label.textContent = `Breed of Dog ${i}:`;

                let input = document.createElement("input");
                input.type = "text";
                input.name = `dog-breed-${i}`;
                input.required = true;

                breedContainer.appendChild(label);
                breedContainer.appendChild(input);
            }
        }
    }

    // Update breed fields when the number of dogs changes
    numDogsInput.addEventListener("input", updateBreedFields);

    // Prevent appointments on weekends & Mondays
    appointmentDate.addEventListener("input", function () {
        let selectedDate = new Date(appointmentDate.value);
        let dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday

        if (dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 1) {
            alert("Appointments are only available from Tuesday to Friday.");
            appointmentDate.value = "";
        }
    });

    // Form Submission Logic
    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let customerName = document.getElementById("customer-name").value;
        let phoneNumber = document.getElementById("phone-number").value;
        let dogSize = document.getElementById("dog-size").value;
        let numDogs = parseInt(numDogsInput.value);
        let selectedDate = appointmentDate.value;

        // Collect breed information dynamically
        let dogBreeds = [];
        for (let i = 1; i <= numDogs; i++) {
            let breedInput = document.getElementsByName(`dog-breed-${i}`)[0];
            if (breedInput) {
                dogBreeds.push(breedInput.value);
            }
        }

        // Ensure all required fields are filled
        if (!customerName || !phoneNumber || !selectedDate || numDogs <= 0 || dogBreeds.includes("")) {
            alert("Please fill out all required fields.");
            return;
        }

        // Store submission status in localStorage (temporary until backend setup)
        localStorage.setItem("appointmentSubmitted", "true");

        // Show confirmation message
        appointmentForm.innerHTML = `<p>✅ Thank you, ${customerName}! Your appointment for ${numDogs} dog(s) on ${selectedDate} has been submitted.</p>`;
    });
});
