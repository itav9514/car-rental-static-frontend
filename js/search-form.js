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

  // Toggle drop-off section with smooth animation
  function toggleDropoff() {
    const isDifferent = diffRadio.checked;

    if (isDifferent) {
      dropoffGroup.style.display = 'flex';
      dropoffGroup.style.height = '0px';
      dropoffGroup.style.opacity = '0';
      dropoffGroup.offsetHeight; // force reflow

      const contentHeight = dropoffGroup.scrollHeight + 'px';
      dropoffGroup.style.height = contentHeight;
      dropoffGroup.style.opacity = '1';
      dropoffLocation.required = true;
    } else {
      dropoffGroup.style.height = dropoffGroup.scrollHeight + 'px';
      dropoffGroup.offsetHeight; // force reflow

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
  toggleDropoff(); // run once on load

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

  // Set sensible default range
  const today = new Date();
  const defaultEnd = new Date(today);
  defaultEnd.setDate(today.getDate() + 3);
  picker.setDateRange(today, defaultEnd);

  // Keep the visible input always up-to-date
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

  // Force initial display
  updateDateDisplay();

  // ────────────────────────────────────────────────
  // Form submission
  // ────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const start = picker.getStartDate();
    const end   = picker.getEndDate();

    // ─── Reliable validation ────────────────────────────────────────
    if (!start || !end) {
      alert('Please select both pickup and drop-off dates');
      return;
    }

    const startJS = start.toJSDate();
    const endJS   = end.toJSDate();

    if (isNaN(startJS.getTime()) || isNaN(endJS.getTime())) {
      alert('Invalid date range. Please select again.');
      return;
    }

    if (endJS < startJS) {
      alert('Drop-off date cannot be before pickup date');
      return;
    }

    // ─── Prepare data ───────────────────────────────────────────────
    const pickupDate  = start.format('YYYY-MM-DD');
    const dropoffDate = end.format('YYYY-MM-DD');

    const pickupLoc = document.getElementById('pickup-location')?.value.trim();

    if (!pickupLoc) {
      alert('Please enter a pickup location');
      return;
    }

    const isSame = sameRadio.checked;

    // ─── Decide which place details to send ─────────────────────────
    let pickupPlaceDetails   = null;
    let dropoffPlaceDetails  = null;

    if (!pickupLoc || pickupLoc === DEFAULT_PICKUP.formatted_address) {
      pickupPlaceDetails = DEFAULT_PICKUP;
    }

    if (isSame) {
      dropoffPlaceDetails = pickupPlaceDetails; // same as pickup
    } else {
      const dropoffLoc = dropoffLocation?.value.trim();
      if (!dropoffLoc || dropoffLoc === DEFAULT_DROPOFF.formatted_address) {
        dropoffPlaceDetails = DEFAULT_DROPOFF;
      }
    }

    const bookingData = {
      pickupLocation: pickupLoc || DEFAULT_PICKUP.formatted_address,
      pickupPlaceDetails,           // contains lat/lng when using default

      dropoffLocation: isSame
        ? (pickupLoc || DEFAULT_PICKUP.formatted_address)
        : (dropoffLocation?.value.trim() || DEFAULT_DROPOFF.formatted_address),

      dropoffPlaceDetails,          // contains lat/lng when using default or same

      sameDropoff: isSame,

      pickupDateTime: `${pickupDate}T${pickupTime.value || '09:00'}`,
      dropoffDateTime: `${dropoffDate}T${dropoffTime.value || '17:00'}`,
    };

    console.log('Submitting booking data:', bookingData);

    try {
      const res = await fetch('https://your-domain.com/api/CarRentalEnquiries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP ${res.status}`);
      }

      alert('Search request sent successfully!');
      // window.location.href = '/results.html'; // uncomment if needed

    } catch (err) {
      console.error('Submission error:', err);
      alert('Error sending request: ' + err.message);
    }
  });
});