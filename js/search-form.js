document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  if (!form) {
    console.error('Form not found');
    return;
  }

  // Elements
  const sameRadio       = document.getElementById('sameDropoff');
  const diffRadio       = document.getElementById('differentDropoff');
  const dropoffGroup    = document.getElementById('dropoff-group');
  const dropoffLocation = document.getElementById('dropoff-location');
  const dateDisplay     = document.getElementById('pickup-date-display');
  const pickupTime      = document.getElementById('pickup-time');
  const dropoffTime     = document.getElementById('dropoff-time');
  const submitBtn       = form.querySelector('button[type="submit"]');

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

  // Toggle drop-off section
  function toggleDropoff() {
    const isDifferent = diffRadio.checked;

    if (isDifferent) {
      dropoffGroup.style.display = 'flex';
      dropoffGroup.style.height = '0px';
      dropoffGroup.style.opacity = '0';
      dropoffGroup.offsetHeight; // force reflow

      dropoffGroup.style.height = dropoffGroup.scrollHeight + 'px';
      dropoffGroup.style.opacity = '1';
      dropoffLocation.required = true;
    } else {
      dropoffGroup.style.height = dropoffGroup.scrollHeight + 'px';
      dropoffGroup.offsetHeight;

      dropoffGroup.style.height = '0px';
      dropoffGroup.style.opacity = '0';

      setTimeout(() => {
        dropoffGroup.style.display = 'none';
        dropoffGroup.style.height = '';
      }, 400);

      dropoffLocation.required = false;
    }
  }

  sameRadio.addEventListener('change', toggleDropoff);
  diffRadio.addEventListener('change', toggleDropoff);
  toggleDropoff(); // initial state

  // ────────────────────────────────────────────────
  // Litepicker – RANGE mode
  // ────────────────────────────────────────────────
  const picker = new Litepicker({
    element: dateDisplay,
    singleMode: false,
    format: 'DD MMM YYYY',
    delimiter: ' → ',
    autoApply: true,
    numberOfColumns: 2,
    numberOfMonths: 2,
    minDate: new Date(),
    allowRepick: true,
    parentEl: document.body,
    mobileFriendly: true,
  });

  const today = new Date();
  const defaultEnd = new Date(today);
  defaultEnd.setDate(today.getDate() + 3);
  picker.setDateRange(today, defaultEnd);

  const updateDateDisplay = () => {
    const start = picker.getStartDate();
    const end   = picker.getEndDate();

    if (start && end) {
      dateDisplay.value = `${start.format('DD MMM YYYY')} → ${end.format('DD MMM YYYY')}`;
    } else if (start) {
      dateDisplay.value = start.format('DD MMM YYYY') + ' → Select return date';
    } else {
      dateDisplay.value = 'Select pickup & return dates';
    }
  };

  picker.on('selected', updateDateDisplay);
  picker.on('render', updateDateDisplay);
  picker.on('clear', updateDateDisplay);
  picker.on('button:apply', updateDateDisplay);
  updateDateDisplay();

  // ────────────────────────────────────────────────
  // Form submission → sessionStorage + redirect
  // ────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable button & show loading
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Searching...';
    }

    const start = picker.getStartDate();
    const end   = picker.getEndDate();

    // Validation
    if (!start || !end) {
      alert('Please select both pickup and return dates');
      resetButton();
      return;
    }

    const startJS = start.toJSDate();
    const endJS   = end.toJSDate();

    if (isNaN(startJS.getTime()) || isNaN(endJS.getTime())) {
      alert('Invalid date range. Please select again.');
      resetButton();
      return;
    }

    if (endJS < startJS) {
      alert('Return date cannot be before pickup date');
      resetButton();
      return;
    }

    const pickupLoc = document.getElementById('pickup-location')?.value.trim() || '';

    if (!pickupLoc) {
      alert('Please enter a pickup location');
      resetButton();
      return;
    }

    const isSame = sameRadio.checked;

    let pickupPlaceDetails  = null;
    let dropoffPlaceDetails = null;

    if (!pickupLoc || pickupLoc === DEFAULT_PICKUP.formatted_address) {
      pickupPlaceDetails = DEFAULT_PICKUP;
    }

    if (isSame) {
      dropoffPlaceDetails = pickupPlaceDetails || DEFAULT_PICKUP;
    } else {
      const dropoffLoc = dropoffLocation?.value.trim() || '';
      if (!dropoffLoc || dropoffLoc === DEFAULT_DROPOFF.formatted_address) {
        dropoffPlaceDetails = DEFAULT_DROPOFF;
      }
    }

    const bookingData = {
      pickupLocation: pickupLoc || DEFAULT_PICKUP.formatted_address,
      pickupPlaceDetails,

      dropoffLocation: isSame
        ? (pickupLoc || DEFAULT_PICKUP.formatted_address)
        : (dropoffLocation?.value.trim() || DEFAULT_DROPOFF.formatted_address),

      dropoffPlaceDetails,

      sameDropoff: isSame,

      pickupDateTime:  `${start.format('YYYY-MM-DD')}T${pickupTime.value  || '09:00'}`,
      dropoffDateTime: `${end.format('YYYY-MM-DD')}T${dropoffTime.value || '17:00'}`,

      // Optional: timestamp when search was made
      searchTimestamp: new Date().toISOString(),
    };

    // Save to sessionStorage
    try {
      sessionStorage.setItem('lastCarRentalSearch', JSON.stringify(bookingData));
      console.log('Search data saved to sessionStorage:', bookingData);

      // Optional: still try to send to backend (fire-and-forget style)
      fetch('/api/CarRentalEnquiries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      }).catch(err => {
        console.warn('Backend save failed, but search proceeds:', err);
      });

      // Redirect to results
      window.location.href = 'result.html';

    } catch (err) {
      console.error('Error saving search:', err);
      alert('Failed to save search data. Please try again.');
      resetButton();
    }
  });

  function resetButton() {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Search Cars'; // ← change to your actual button text
    }
  }
});