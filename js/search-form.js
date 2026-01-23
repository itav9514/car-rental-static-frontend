document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  if (!form) {
    console.error('Form not found');
    return;
  }

  // Elements
  const sameRadio          = document.getElementById('sameDropoff');
  const diffRadio          = document.getElementById('differentDropoff');
  const dropoffGroup       = document.getElementById('dropoff-group');
  const dropoffLocation    = document.getElementById('dropoff-location');
  const pickupDateDisplay  = document.getElementById('pickup-date-display');
  const pickupTime         = document.getElementById('pickup-time');
  const dropoffTime        = document.getElementById('dropoff-time');

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

  // Toggle drop-off location visibility
  function toggleDropoff() {
    const isDifferent = diffRadio.checked;
    dropoffGroup.style.display = isDifferent ? 'block' : 'none';
    if (dropoffLocation) dropoffLocation.required = isDifferent;
  }

  sameRadio.addEventListener('change', toggleDropoff);
  diffRadio.addEventListener('change', toggleDropoff);
  toggleDropoff();

  // Litepicker – only pickup date is visible, but it still handles range internally
  const picker = new Litepicker({
    element: pickupDateDisplay,
    singleMode: false,                      // still range mode (hidden end date)
    format: 'DD MMM YYYY',
    delimiter: ' → ',
    autoApply: true,
    numberOfColumns: 2,
    numberOfMonths: 2,
    minDate: new Date(),
    allowRepick: true,
    parentEl: document.body,
  });

  // Default: today → today + 3 days
  const today = new Date();
  const defaultEnd = new Date(today);
  defaultEnd.setDate(today.getDate() + 3);
  picker.setDateRange(today, defaultEnd);

  // Show only pickup date in the visible field
  const updatePickupDisplay = () => {
    const startDate = picker.getStartDate();
    if (startDate) {
      pickupDateDisplay.value = startDate.format('DD MMM YYYY');
    } else {
      pickupDateDisplay.value = 'Select pickup date';
    }
  };

  picker.on('selected', updatePickupDisplay);
  picker.on('render', updatePickupDisplay);
  updatePickupDisplay();

  // Form submission – drop-off date is calculated automatically
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const start = picker.getStartDate();
    if (!start) {
      alert('Please select pickup date');
      return;
    }

    // Calculate drop-off date automatically (e.g. +3 days from pickup)
    const dropoffCalculated = new Date(start);
    dropoffCalculated.setDate(start.getDate() + 3); // ← you can change this logic

    const pickupDate  = start.toISOString().split('T')[0];
    const dropoffDate = dropoffCalculated.toISOString().split('T')[0];

    const pickupLoc = document.getElementById('pickup-location')?.value.trim() || '';

    if (!pickupLoc) {
      alert('Please enter pickup location');
      return;
    }

    const isSame = sameRadio.checked;

    const bookingData = {
      pickupLocation: pickupLoc || DEFAULT_PICKUP.formatted_address,
      pickupPlaceDetails: pickupLoc ? null : DEFAULT_PICKUP,

      dropoffLocation: isSame 
        ? (pickupLoc || DEFAULT_PICKUP.formatted_address)
        : (dropoffLocation?.value.trim() || DEFAULT_DROPOFF.formatted_address),
      dropoffPlaceDetails: isSame 
        ? (pickupLoc ? null : DEFAULT_PICKUP)
        : (dropoffLocation?.value.trim() ? null : DEFAULT_DROPOFF),

      sameDropoff: isSame,

      pickupDateTime: `${pickupDate}T${pickupTime.value || '09:00'}`,
      dropoffDateTime: `${dropoffDate}T${dropoffTime.value || '17:00'}`,
    };

    console.log('Submitting:', bookingData);

    try {
      const res = await fetch('https://your-domain.com/api/CarRentalEnquiries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!res.ok) throw new Error(await res.text() || 'Failed');

      alert('Search request sent successfully!');
      // window.location.href = '/results.html'; // optional
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  });
});