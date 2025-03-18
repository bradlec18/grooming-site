document.addEventListener("DOMContentLoaded", function () {
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentDate = document.getElementById("appointment-date");

    // Check if the user has already submitted the form
    if (localStorage.getItem("appointmentSubmitted")) {
        appointmentForm.innerHTML = "<p>You have already submitted an appointment request.</p>";
        return;
    }

    // Disable weekends (Saturday & Sunday) and Monday
    appointmentDate.addEventListener("input", function () {
        let selectedDate = new Date(appointmentDate.value);
        let dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday

        if (dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 1) {
            alert("Appointments are only available from Tuesday to Friday.");
            appointmentDate.value = ""; // Reset the date input
        }
    });

    // Scheduling Logic
    const maxDogsPerDay = 15;
    let scheduledDogs = {
        small: 0,
        medium: 0,
        large: 0
    };

    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let dogSize = document.getElementById("dog-size").value;
        let numDogs = parseInt(document.getElementById("num-dogs").value);

        if (scheduledDogs.small + scheduledDogs.medium + scheduledDogs.large + numDogs > maxDogsPerDay) {
            alert("Sorry, the maximum number of 15 dogs per day has been reached.");
            return;
        }

        if (dogSize === "small" && scheduledDogs.small + numDogs > 9) {
            alert("Sorry, only 9 small dogs can be scheduled per day.");
            return;
        }

        if (dogSize === "medium" && scheduledDogs.medium + numDogs > 3) {
            alert("Sorry, only 3 medium dogs can be scheduled per day.");
            return;
        }

        if (dogSize === "large" && scheduledDogs.large + numDogs > 3) {
            alert("Sorry, only 3 large dogs can be scheduled per day.");
            return;
        }

        // Additional logic for small & medium combos
        if (scheduledDogs.medium >= 6 && scheduledDogs.small + numDogs > 6) {
            alert("With 6 medium dogs scheduled, only 6 small dogs are allowed.");
            return;
        }

        if (scheduledDogs.small >= 8 && scheduledDogs.medium + numDogs > 4) {
            alert("With 8 small dogs scheduled, only 4 medium dogs are allowed.");
            return;
        }

        // Update scheduled dogs count
        scheduledDogs[dogSize] += numDogs;

        // Store submission status in localStorage
        localStorage.setItem("appointmentSubmitted", "true");

        // Show a message and disable the form
        appointmentForm.innerHTML = "<p>Thank you! Your appointment has been submitted.</p>";
    });
});
