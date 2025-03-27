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

    // Send data to Google Apps Script
    fetch("https://script.google.com/macros/s/AKfycbygvWZCt4UBw4LnJu3ItqlKgXhjs7CJ1knQ7XtAIuSzIJUpX-28zUbrldttY9AP4GD8rw/exec" , {
        method: "POST",
        body: JSON.stringify({
            name: customerName,
            phone: phoneNumber,
            date: selectedDate,
            numDogs: numDogs,
            dogNames: dogNames,
            dogBreeds: dogBreeds,
            dogSizes: dogSizes
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log("Success:", result);
        appointmentForm.innerHTML = `<p>✅ Thank you, ${customerName}! Your appointment for ${numDogs} dog(s) on ${selectedDate} has been submitted.</p>`;
    })
    .catch(error => {
        console.error("Error:", error);
        alert("There was a problem submitting your appointment. Please try again.");
    });
}); 