document.addEventListener("DOMContentLoaded", async function () {
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentDateInput = document.getElementById("appointment-date");
    const numDogsInput = document.getElementById("num-dogs");
    const dogInfoContainer = document.getElementById("dog-info-container");

    const availabilityDisplay = document.createElement("div");
    availabilityDisplay.id = "availability-display";
    appointmentDateInput.parentNode.insertBefore(availabilityDisplay, appointmentDateInput.nextSibling);

    const SHEETDB_API = "https://sheetdb.io/api/v1/8umqwpfdx1nak";
    let bookingsByDate = {};

    async function loadBookings() {
        try {
            const res = await fetch(SHEETDB_API);
            const data = await res.json();
            bookingsByDate = {};

            data.forEach(entry => {
                const date = entry.date;
                const size = entry.dog_size;
                if (!bookingsByDate[date]) {
                    bookingsByDate[date] = { small: 0, medium: 0, large: 0 };
                }
                if (["small", "medium", "large"].includes(size)) {
                    bookingsByDate[date][size]++;
                }
            });
        } catch (err) {
            console.error("Error loading bookings:", err);
        }
    }

    function getMaxAllowedMedium(small) {
        if (small >= 9) return 3;
        if (small >= 8) return 4;
        if (small >= 7) return 5;
        if (small >= 6) return 6;
        return 6;
    }

    function getMaxAllowedSmall(medium) {
        if (medium >= 6) return 6;
        if (medium === 5) return 7;
        if (medium === 4) return 8;
        return 9;
    }

    function updateAvailabilityDisplay(dateStr) {
        const bookings = bookingsByDate[dateStr] || { small: 0, medium: 0, large: 0 };

        const maxSmall = getMaxAllowedSmall(bookings.medium);
        const maxMedium = getMaxAllowedMedium(bookings.small);

        const smallLeft = Math.max(0, maxSmall - bookings.small);
        const mediumLeft = Math.max(0, maxMedium - bookings.medium);
        const largeLeft = Math.max(0, 3 - bookings.large);

        availabilityDisplay.innerHTML = `
          <p>🐾 <strong>Availability for ${dateStr}</strong></p>
          <p>Small dogs: ${smallLeft} slot(s) left</p>
          <p>Medium dogs: ${mediumLeft} slot(s) left</p>
          <p>Large dogs: ${largeLeft} slot(s) left</p>
        `;
    }

    function isDateFullyBooked(dateStr) {
        const bookings = bookingsByDate[dateStr] || { small: 0, medium: 0, large: 0 };
        const total = bookings.small + bookings.medium + bookings.large;
        const small = bookings.small;
        const medium = bookings.medium;
        const large = bookings.large;

        const smallMediumLimitReached =
            (medium >= 6 && small >= 6) ||
            (medium === 5 && small >= 7) ||
            (medium === 4 && small >= 8) ||
            (medium <= 3 && small >= 9);

        const smallMediumTotal = small + medium;

        return (
            total >= 15 ||
            (smallMediumTotal >= 12 && smallMediumLimitReached && large >= 3)
        );
    }

    function initFlatpickr() {
        flatpickr(appointmentDateInput, {
            dateFormat: "Y-m-d",
            minDate: "today",
            disable: [
                date => {
                    const day = date.getDay();
                    return day === 0 || day === 1 || day === 6;
                },
                date => {
                    const dateStr = date.toISOString().split("T")[0];
                    return isDateFullyBooked(dateStr);
                }
            ],
            onChange: (selectedDates, dateStr) => {
                if (dateStr) {
                    updateAvailabilityDisplay(dateStr);
                } else {
                    availabilityDisplay.innerHTML = "";
                }
            }
        });
    }

    function updateDogFields() {
        dogInfoContainer.innerHTML = "";
        const numDogs = parseInt(numDogsInput.value);
        if (numDogs > 0 && numDogs <= 15) {
            for (let i = 1; i <= numDogs; i++) {
                const nameLabel = document.createElement("label");
                nameLabel.textContent = `Dog ${i} Name:`;
                const nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.name = `dog-name-${i}`;
                nameInput.required = true;

                const breedLabel = document.createElement("label");
                breedLabel.textContent = `Dog ${i} Breed:`;
                const breedInput = document.createElement("input");
                breedInput.type = "text";
                breedInput.name = `dog-breed-${i}`;
                breedInput.required = true;

                const sizeLabel = document.createElement("label");
                sizeLabel.textContent = `Dog ${i} Size:`;
                const sizeSelect = document.createElement("select");
                sizeSelect.name = `dog-size-${i}`;
                sizeSelect.required = true;
                ["small", "medium", "large"].forEach(size => {
                    const option = document.createElement("option");
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

    appointmentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("customer-name").value;
        const phone = document.getElementById("phone-number").value;
        const dateRaw = appointmentDateInput.value;
        const dateObj = new Date(dateRaw);
        const date = dateObj.toISOString().split("T")[0];
        const numDogs = parseInt(numDogsInput.value);

        if (!name || !phone || !date || isNaN(numDogs) || numDogs <= 0) {
            alert("Please fill out all fields.");
            return;
        }

        let newDogs = { small: 0, medium: 0, large: 0 };
        let dogDataList = [];

        for (let i = 1; i <= numDogs; i++) {
            const dog_name = document.getElementsByName(`dog-name-${i}`)[0].value;
            const dog_breed = document.getElementsByName(`dog-breed-${i}`)[0].value;
            const dog_size = document.getElementsByName(`dog-size-${i}`)[0].value;

            if (!dog_name || !dog_breed || !dog_size) {
                alert("Please complete all dog fields.");
                return;
            }

            newDogs[dog_size]++;
            dogDataList.push({ dog_name, dog_breed, dog_size });
        }

        const current = bookingsByDate[date] || { small: 0, medium: 0, large: 0 };
        const total = current.small + current.medium + current.large + numDogs;
        const newSmall = current.small + newDogs.small;
        const newMedium = current.medium + newDogs.medium;
        const newLarge = current.large + newDogs.large;

        if (total > 15) return alert("Daily limit of 15 dogs exceeded.");
        if (newLarge > 3) return alert("Only 3 large dogs allowed per day.");
        if (newSmall > 9) return alert("Only 9 small dogs allowed.");
        if (newMedium > 6) return alert("Only 6 medium dogs allowed.");
        if (newMedium >= 6 && newSmall > 6) return alert("With 6 medium dogs, only 6 small allowed.");
        if (newMedium === 5 && newSmall > 7) return alert("With 5 medium dogs, only 7 small allowed.");
        if (newMedium === 4 && newSmall > 8) return alert("With 4 medium dogs, only 8 small allowed.");
        if (newMedium <= 3 && newSmall > 9) return alert("Only 9 small dogs allowed if 3 or fewer medium dogs.");

        try {
            await Promise.all(
                dogDataList.map(dog => {
                    const data = {
                        data: {
                            name, phone, date,
                            dog_name: dog.dog_name,
                            dog_breed: dog.dog_breed,
                            dog_size: dog.dog_size
                        }
                    };
                    return fetch(SHEETDB_API, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                })
            );

            appointmentForm.innerHTML = `<p>✅ Appointment booked successfully for ${date}. Thank you!</p>`;
            await loadBookings();
            updateAvailabilityDisplay(date);
        } catch (err) {
            console.error("Submission error:", err);
            alert("There was a problem submitting your appointment.");
        }
    });

    await loadBookings();
    initFlatpickr();
});
