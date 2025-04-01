document.addEventListener("DOMContentLoaded", async function () {
    const appointmentForm = document.getElementById("appointment-form");
    const appointmentDateInput = document.getElementById("appointment-date");
    const numDogsInput = document.getElementById("num-dogs");
    const dogInfoContainer = document.getElementById("dog-info-container");
  
    const SHEETDB_API = "https://sheetdb.io/api/v1/8umqwpfdx1nak";
    let bookingsByDate = {};
  
    // Load existing bookings
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
  
    // Date blocking logic
    function isDateFullyBooked(dateStr) {
      const bookings = bookingsByDate[dateStr] || { small: 0, medium: 0, large: 0 };
      const total = bookings.small + bookings.medium + bookings.large;
  
      // Fully booked means: max 15 dogs, OR 3 large dogs, AND small+medium logic
      const small = bookings.small;
      const medium = bookings.medium;
      const large = bookings.large;
  
      const smallMediumLimitReached =
        (medium >= 6 && small >= 6) ||
        (medium === 5 && small >= 7) ||
        (medium === 4 && small >= 8) ||
        (medium <= 3 && small >= 9);
  
      const largeFull = large >= 3;
      const smallMediumTotal = small + medium;
  
      return (
        (smallMediumTotal >= 12 && smallMediumLimitReached) &&
        largeFull
      );
    }
  
    // Setup flatpickr
    function initFlatpickr() {
      flatpickr(appointmentDateInput, {
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [
          function (date) {
            const day = date.getDay();
            return day === 0 || day === 1 || day === 6;
          },
          function (date) {
            const dateStr = date.toISOString().split("T")[0];
            return isDateFullyBooked(dateStr);
          }
        ]
      });
    }
  
    // Generate dog input fields
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
  
    // Handle form submission
    appointmentForm.addEventListener("submit", async function (event) {
      event.preventDefault();
  
      const name = document.getElementById("customer-name").value;
      const phone = document.getElementById("phone-number").value;
      const dateRaw = appointmentDateInput.value;
      const date = new Date(dateRaw).toISOString().split("T")[0];
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
        await Promise.all(dogDataList.map(dog => {
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
        }));
  
        appointmentForm.innerHTML = `<p>✅ Appointment booked successfully for ${date}. Thank you!</p>`;
        await loadBookings(); // Refresh blocked dates
      } catch (err) {
        console.error("Submission error:", err);
        alert("There was a problem submitting your appointment.");
      }
    });
  
    await loadBookings();
    initFlatpickr();
  }); 