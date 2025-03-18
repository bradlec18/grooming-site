document.addEventListener("DOMContentLoaded", function () {
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentDate = document.getElementById("appointment-date");
    const numDogsInput = document.getElementById("num-dogs");
    const dogSizeInput = document.getElementById("dog-size");

    let appointments = {}; // This will store the JSON data

    // Fetch available slots from the JSON file
    fetch("appointments.json")
        .then(response => response.json())
        .then(data => {
            appointments = data.appointments;
        })
        .catch(error => console.error("Error loading appointment data:", error));

    // Disable weekends (Saturday & Sunday) and Monday
    appointmentDate.addEventListener("input", function () {
        let selectedDate = appointmentDate.value;
        let selectedDay = new Date(selectedDate).getDay();

        if (selectedDay === 0 || selectedDay === 6 || selectedDay === 1) {
            alert("Appointments are only available from Tuesday to Friday.");
            appointmentDate.value = "";
            return;
        }

        // Check if the selected date is fully booked
        let appointment = appointments.find(a => a.date === selectedDate);
        if (appointment) {
            let totalBooked = appointment.slots.small + appointment.slots.medium + appointment.slots.large;
            if (totalBooked >= 15) {
                alert("This date is fully booked. Please choose another day.");
                appointmentDate.value = "";
            }
        }
    });

    // Prevent overbooking based on dog size
    appointmentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let selectedDate = appointmentDate.value;
        let numDogs = parseInt(numDogsInput.value);
        let dogSize = dogSizeInput.value;

        let appointment = appointments.find(a => a.date === selectedDate);

        if (!appointment) {
            appointment = { date: selectedDate, slots: { small: 0, medium: 0, large: 0 } };
            appointments.push(appointment);
        }

        let totalBooked = appointment.slots.small + appointment.slots.medium + appointment.slots.large;
        if (totalBooked + numDogs > 15) {
            alert("Maximum 15 dogs per day. Reduce the number of dogs.");
            return;
        }

        if (dogSize === "small" && appointment.slots.small + numDogs > 9) {
            alert("Only 9 small dogs can be booked per day.");
            return;
        }

        if (dogSize === "medium" && appointment.slots.medium + numDogs > 3) {
            alert("Only 3 medium dogs can be booked per day.");
            return;
        }

        if (dogSize === "large" && appointment.slots.large + numDogs > 3) {
            alert("Only 3 large dogs can be booked per day.");
            return;
        }

        // Update the JSON data (simulated)
        appointment.slots[dogSize] += numDogs;

        // Save to localStorage to simulate saving
        localStorage.setItem("appointments", JSON.stringify(appointments));

        alert("✅ Appointment booked successfully!");
        appointmentForm.reset();
    });
}); 