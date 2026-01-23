// booking-form.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    const DEFAULT_PICKUP = {
        formatted_address: "Indira Gandhi International Airport, New Delhi, Delhi 110037, India",
        name: "Indira Gandhi International Airport",
        geometry: { location: { lat: 28.5562, lng: 77.1000 } }
    };

    const DEFAULT_DROPOFF = {
        formatted_address: "Cyber City, Gurugram, Haryana 122002, India",
        name: "Cyber Hub",
        geometry: { location: { lat: 28.4950, lng: 77.0880 } }
    };

    if (!form) {
        console.error('Form not found');
        return;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();


        // Inside submit handler, after e.preventDefault()

        const fullNameInput = document.getElementById('full-name');
        const emailInput = document.getElementById('email');
        const countryCodeSelect = document.getElementById('country-code');
        const phoneInput = document.getElementById('phone-number');

        const carSelect = form.querySelector('select[name="car_type"]');
        const driverAgeInput = form.querySelector('input[placeholder="Enter Driver Age"]');
        const pickupLocInput = document.getElementById('pickup-location');
        const dropoffLocInput = document.getElementById('dropoff-location');
        const pickupDate = form.querySelectorAll('input[type="date"]')[0];
        const pickupTime = form.querySelectorAll('input[type="time"]')[0];
        const dropoffDate = form.querySelectorAll('input[type="date"]')[1];
        const dropoffTime = form.querySelectorAll('input[type="time"]')[1];

        const pickupValue = pickupLocInput?.value.trim() || "";
        const dropoffValue = dropoffLocInput?.value.trim() || "";


        const name = fullNameInput?.value.trim() || "";
        const email = emailInput?.value.trim() || "";
        const countryCode = countryCodeSelect?.value || "+91";
        const phoneRaw = phoneInput?.value.trim().replace(/\D/g, '') || ""; // only digits
        const phone = countryCode + phoneRaw; // E.164 format

        const bookingData = {

            name,
            email,
            phone,


            carType: carSelect?.options[carSelect.selectedIndex]?.text || null,
            carTypeValue: carSelect?.value || "",
            driverAge: driverAgeInput?.value.trim() || "",

            pickupLocation: pickupValue || DEFAULT_PICKUP.formatted_address,
            pickupPlaceDetails: pickupValue ? null : DEFAULT_PICKUP,

            dropoffLocation: dropoffValue || DEFAULT_DROPOFF.formatted_address,
            dropoffPlaceDetails: dropoffValue ? null : DEFAULT_DROPOFF,

            sameDropoff: dropoffLocInput?.value.trim() === pickupLocInput?.value.trim(),

            pickupDateTime: pickupDate?.value && pickupTime?.value ? `${pickupDate.value}T${pickupTime.value}` : null,
            dropoffDateTime: dropoffDate?.value && dropoffTime?.value ? `${dropoffDate.value}T${dropoffTime.value}` : null,
        };


        if (!name || name.length < 2) {
            alert("Please enter your full name (at least 2 characters)");
            return;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email address");
            return;
        }

        if (!phoneRaw || phoneRaw.length < 7 || phoneRaw.length > 15) {
            alert("Please enter a valid phone number (7–15 digits)");
            return;
        }

        // Optional: stronger E.164 check
        if (!phone.startsWith('+') || !/^\+\d{7,15}$/.test(phone)) {
            alert("Phone number format invalid. It should be in E.164 format (e.g. +919876543210)");
            return;
        }


        // validation
        if (!bookingData.carTypeValue) { alert("Please select a car type"); return; }
        const driverAgeNum = Number(bookingData.driverAge);

        if (!bookingData.driverAge || isNaN(driverAgeNum)) {
            alert("Please enter a valid driver age (numbers only)");
            driverAgeInput?.focus(); // optional: focus the field
            return;
        }

        if (driverAgeNum < 18) {
            alert("Driver must be at least 18 years old");
            driverAgeInput?.focus();
            return;
        }

        if (driverAgeNum > 120) {
            alert("Driver age cannot exceed 120 years");
            driverAgeInput?.focus();
            return;
        }


        // if (!bookingData.pickupLocation)        { alert("Please enter pick-up location"); return; }
        // if (!bookingData.dropoffLocation)       { alert("Please enter drop-off location"); return; }
        if (!bookingData.pickupDateTime) { alert("Please select pick-up date & time"); return; }
        if (!bookingData.dropoffDateTime) { alert("Please select drop-off date & time"); return; }

        // You can now safely send bookingData
        console.log('Submitting:', bookingData);


        // 4. Send to backend
        try {
            const response = await fetch('https://localhost:32769/api/CarRentalEnquiries/', {   // ← change this URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'X-CSRFToken': getCookie('csrftoken'),   // if using Django CSRF
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Booking failed');
            }

            const result = await response.json();
            console.log('Booking successful:', result);

            alert('Booking submitted successfully! Redirecting to thank-you page...');
            localStorage.setItem('lastBooking', JSON.stringify(result));
            window.location.href = '/thank-you.html';          
              // Optional: redirect
            // window.location.href = '/booking-confirmation/' + result.bookingId;

        } catch (err) {
            console.error('Booking error:', err);
            alert('Failed to create booking: ' + err.message);
        }
    });
});

// Helper: convert "7:00AM" → "07:00", "1:00PM" → "13:00"
function convertTo24Hour(timeStr) {
    if (!timeStr || timeStr === "12:00AM") return "00:00";

    let [time, period] = timeStr.split(/(AM|PM)/);
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) {
        hours += 12;
    }
    if (period === "AM" && hours === 12) {
        hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Optional: Django CSRF helper (uncomment if needed)
/*
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
*/