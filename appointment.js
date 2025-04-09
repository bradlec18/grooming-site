document.addEventListener("DOMContentLoaded", async function () {
  const appointmentForm = document.getElementById("appointment-form");
  const appointmentDateInput = document.getElementById("appointment-date");
  const numDogsInput = document.getElementById("num-dogs");
  const dogInfoContainer = document.getElementById("dog-info-container");

  const SHEETDB_API = "https://sheetdb.io/api/v1/8umqwpfdx1nak";
  let bookingsByDate = {};
  let flatpickrInstance = null;

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

  function showAvailability(dateStr) {
    const containerId = "availability-info";
    let availabilityContainer = document.getElementById(containerId);

    if (!availabilityContainer) {
      availabilityContainer = document.createElement("div");
      availabilityContainer.id = containerId;
      appointmentDateInput.parentNode.insertBefore(availabilityContainer, appointmentDateInput.nextSibling);
    }

    const bookings = bookingsByDate[dateStr] || { small: 0, medium: 0, large: 0 };
    const maxShared = 12, maxSmall = 9, maxMedium = 6;
    const small = bookings.small, medium = bookings.medium, large = bookings.large;
    const sharedUsed = small + medium;

    let availableSmall = Math.min(maxSmall - small, maxShared - sharedUsed);
    let availableMedium = Math.min(maxMedium - medium, maxShared - sharedUsed);
    const availableLarge = Math.max(0, 3 - large);
    if (availableSmall < 0) availableSmall = 0;
    if (availableMedium < 0) availableMedium = 0;

    let specialNote = "";
    let smallMedHTML = `
      <li>Small dogs: ${availableSmall}/9 slots left</li>
      <li>Medium dogs: ${availableMedium}/6 slots left</li>
    `;

    if (
      (small === 6 && medium === 5) ||
      (small === 7 && medium === 4) ||
      (small === 8 && medium === 3)
    ) {
      specialNote = `<p class="warning">⚠️ Only 1 spot left for a small or medium dog</p>`;
      smallMedHTML = "";
    } else if (small === 5 && medium === 5) {
      specialNote = `<p class="warning">⚠️ You can book 2 small dogs — or 1 small and 1 medium. If booking just 1 dog, either size is still available.</p>`;
      smallMedHTML = "";
    }

    availabilityContainer.innerHTML = `
      <p>🐾 Availability for ${dateStr}:</p>
      ${specialNote}
      <ul>
        ${smallMedHTML}
        <li>Large dogs: ${availableLarge}/3 slots left</li>
      </ul>
    `;
  }

  function isDateFullyBooked(dateStr) {
    const bookings = bookingsByDate[dateStr] || { small: 0, medium: 0, large: 0 };
    const total = bookings.small + bookings.medium + bookings.large;
    const smallMediumLimitReached =
      (bookings.medium >= 6 && bookings.small >= 6) ||
      (bookings.medium === 5 && bookings.small >= 7) ||
      (bookings.medium === 4 && bookings.small >= 8) ||
      (bookings.medium <= 3 && bookings.small >= 9);
    const smallMediumTotal = bookings.small + bookings.medium;
    return total >= 15 || (smallMediumTotal >= 12 && smallMediumLimitReached && bookings.large >= 3);
  }

  function initFlatpickr() {
    flatpickrInstance = flatpickr(appointmentDateInput, {
      dateFormat: "Y-m-d",
      minDate: "today",
      disable: [
        date => [0, 1, 6].includes(date.getDay()),
        date => isDateFullyBooked(date.toISOString().split("T")[0])
      ],
      onReady: function () {
        appointmentDateInput.setAttribute("autocomplete", "off");
        appointmentDateInput.setAttribute("inputmode", "none");
        appointmentDateInput.setAttribute("readonly", "readonly");
        appointmentDateInput.style.caretColor = "transparent";
        appointmentDateInput.style.userSelect = "none";
        appointmentDateInput.style.webkitUserSelect = "none";
        appointmentDateInput.blur();
      },
      onOpen: function () {
        appointmentDateInput.blur();
      },
      onChange: (selectedDates, dateStr) => {
        showAvailability(dateStr);
      }
    });

    // Close the calendar when clicking outside of it
    document.addEventListener("click", function (e) {
      if (
        flatpickrInstance &&
        flatpickrInstance.isOpen &&
        !e.target.closest(".flatpickr-calendar") &&
        !e.target.closest("#appointment-date")
      ) {
        flatpickrInstance.close();
      }
    });
  }

  function updateDogFields() {
    dogInfoContainer.innerHTML = "";
    const numDogs = parseInt(numDogsInput.value);
    if (numDogs > 0 && numDogs <= 4) {
      for (let i = 1; i <= numDogs; i++) {
        const nameInput = `<label>Dog ${i} Name:<input type="text" name="dog-name-${i}" required></label>`;
        const breedInput = `<label>Dog ${i} Breed:<input type="text" name="dog-breed-${i}" required></label>`;
        const sizeInput = `
          <label>Dog ${i} Size:
            <select name="dog-size-${i}" required>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>`;
        dogInfoContainer.insertAdjacentHTML("beforeend", nameInput + breedInput + sizeInput);
      }
    }
  }

  numDogsInput.addEventListener("input", updateDogFields);

  appointmentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("customer-name").value;
    const phone = document.getElementById("phone-number").value;
    const dateRaw = appointmentDateInput.value;
    const date = new Date(dateRaw).toISOString().split("T")[0];
    const numDogs = parseInt(numDogsInput.value);

    if (!name || !phone || !date || isNaN(numDogs) || numDogs <= 0 || numDogs > 4) {
      alert("Please fill out all fields and only book up to 4 dogs.");
      return;
    }

    let newDogs = { small: 0, medium: 0, large: 0 };
    let dogDataList = [];

    for (let i = 1; i <= numDogs; i++) {
      const dog_name = document.getElementsByName(`dog-name-${i}`)[0]?.value;
      const dog_breed = document.getElementsByName(`dog-breed-${i}`)[0]?.value;
      const dog_size = document.getElementsByName(`dog-size-${i}`)[0]?.value;

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
            data: { name, phone, date, dog_name: dog.dog_name, dog_breed: dog.dog_breed, dog_size: dog.dog_size }
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
    } catch (err) {
      console.error("Submission error:", err);
      alert("There was a problem submitting your appointment.");
    }
  });

  await loadBookings();
  initFlatpickr();
}); 