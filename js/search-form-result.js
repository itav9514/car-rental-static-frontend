// main.js - works on both search page and result page

document.addEventListener('DOMContentLoaded', () => {
  const isSearchPage = document.getElementById('searchForm') !== null;
  const isResultPage = document.querySelector('.car-result') !== null;

  // ────────────────────────────────────────────────
  // SHARED CONSTANTS
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  // SEARCH PAGE LOGIC
  // ────────────────────────────────────────────────
  if (isSearchPage) {
    const form = document.getElementById('searchForm');
    const sameRadio       = document.getElementById('sameDropoff');
    const diffRadio       = document.getElementById('differentDropoff');
    const dropoffGroup    = document.getElementById('dropoff-group');
    const dropoffLocation = document.getElementById('dropoff-location');
    const dateDisplay     = document.getElementById('pickup-date-display');
    const pickupTime      = document.getElementById('pickup-time');
    const dropoffTime     = document.getElementById('dropoff-time');
    const pickupLocInput  = document.getElementById('pickup-location');
    const submitBtn       = form.querySelector('button[type="submit"]');

    // Litepicker
    const picker = new Litepicker({
      element: dateDisplay,
      singleMode: false,
      format: 'DD MMM YYYY',
      delimiter: ' → ',
      autoApply: true,
      numberOfColumns: 1,
      numberOfMonths: 2,
      minDate: new Date(),
      allowRepick: true,
      parentEl: document.body,
      mobileFriendly: true,
    });

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

    // Default range
    const today = new Date();
    const defaultEnd = new Date(today);
    defaultEnd.setDate(today.getDate() + 3);
    picker.setDateRange(today, defaultEnd);
    updateDateDisplay();

    // Toggle dropoff
    function toggleDropoff() {
      const isDifferent = diffRadio.checked;
      if (isDifferent) {
        dropoffGroup.style.display = 'flex';
        dropoffGroup.style.height = '0px';
        dropoffGroup.style.opacity = '0';
        dropoffGroup.offsetHeight;
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
    toggleDropoff();

    // Load previous search
    function loadPreviousSearch() {
      const saved = localStorage.getItem('lastCarRentalSearch');
      if (!saved) return;
      try {
        const data = JSON.parse(saved);
        if (data.pickupLocation) pickupLocInput.value = data.pickupLocation;
        if (data.sameDropoff === true) {
          sameRadio.checked = true;
          diffRadio.checked = false;
          dropoffLocation.value = '';
        } else {
          diffRadio.checked = true;
          sameRadio.checked = false;
          if (data.dropoffLocation) dropoffLocation.value = data.dropoffLocation;
        }
        toggleDropoff();

        if (data.pickupDateTime) {
          const pDt = new Date(data.pickupDateTime);
          if (!isNaN(pDt)) pickupTime.value = pDt.toTimeString().slice(0,5);
        }
        if (data.dropoffDateTime) {
          const dDt = new Date(data.dropoffDateTime);
          if (!isNaN(dDt)) dropoffTime.value = dDt.toTimeString().slice(0,5);
        }

        if (data.pickupDateTime && data.dropoffDateTime) {
          const startDate = new Date(data.pickupDateTime);
          const endDate   = new Date(data.dropoffDateTime);
          if (!isNaN(startDate) && !isNaN(endDate) && endDate >= startDate) {
            picker.setDateRange(startDate, endDate);
            updateDateDisplay();
          }
        }
      } catch (err) {
        console.warn('Failed to load previous search', err);
      }
    }

    loadPreviousSearch();

    // Submit handler
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Searching...';

      const start = picker.getStartDate();
      const end   = picker.getEndDate();

      if (!start || !end) {
        alert('Please select both pickup and return dates');
        resetButton();
        return;
      }

      const startJS = start.toJSDate();
      const endJS   = end.toJSDate();

      if (isNaN(startJS.getTime()) || isNaN(endJS.getTime()) || endJS < startJS) {
        alert(endJS < startJS ? 'Return date cannot be before pickup date' : 'Invalid date range');
        resetButton();
        return;
      }

      const pickupLoc = pickupLocInput?.value.trim() || '';
      if (!pickupLoc) {
        alert('Please enter a pickup location');
        resetButton();
        return;
      }

      const isSame = sameRadio.checked;

      let pickupPlaceDetails  = pickupLoc === DEFAULT_PICKUP.formatted_address ? DEFAULT_PICKUP : null;
      let dropoffPlaceDetails = null;

      if (isSame) {
        dropoffPlaceDetails = pickupPlaceDetails || DEFAULT_PICKUP;
      } else {
        const dropoffLoc = dropoffLocation?.value.trim() || '';
        if (dropoffLoc === DEFAULT_DROPOFF.formatted_address) {
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
        searchTimestamp: new Date().toISOString(),
      };

      try {
        localStorage.setItem('lastCarRentalSearch', JSON.stringify(bookingData));
        // Optional backend call (fire-and-forget)
        fetch('https://your-domain.com/api/CarRentalEnquiries/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        }).catch(() => {});

        window.location.href = 'result.html';
      } catch (err) {
        alert('Failed to save search. Please try again.');
        resetButton();
      }
    });

    function resetButton() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Search & Book';
    }
  }

  // ────────────────────────────────────────────────
  // RESULT PAGE LOGIC (car selection)
  // ────────────────────────────────────────────────
  if (isResultPage) {
    document.querySelectorAll('.continue-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const carCard = e.target.closest('.car-result');
        if (!carCard) return;

        const carId = carCard.dataset.carId;
        if (!carId) {
          alert('Car information is missing');
          return;
        }

        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Loading...';

        const title    = carCard.querySelector('h2')?.textContent.trim()       || 'Unknown';
        const subtitle = carCard.querySelector('p')?.textContent.trim()        || '';
        const priceStr = carCard.querySelector('.rst-3 strong')?.textContent.trim() || '0';
        const priceNum = parseFloat(priceStr.match(/[\d,.]+/)?.[0]?.replace(',', '') || '0');
        const currency = priceStr.includes('USD') ? 'USD' : 'Unknown';

        const features = [];
        carCard.querySelectorAll('.person-all span').forEach(span => {
          const val = span.textContent.trim();
          if (val) {
            let type = 'other';
            if (/person|seat/i.test(val)) type = 'passengers';
            if (/suitcase|bag|luggage/i.test(val)) type = 'luggage';
            if (/A|M|Auto|Manual/i.test(val)) type = 'transmission';
            if (/km|range|l\/100km|fuel|battery/i.test(val)) type = 'fuel';
            features.push({ type, value: val });
          }
        });

        const selectedCar = {
          id: carId,
          name: title,
          category: subtitle,
          pricePerWeek: priceNum,
          currency,
          features,
          imageUrl: carCard.querySelector('img')?.src || '',
          selectedAt: new Date().toISOString()
        };

        try {
          localStorage.setItem('selectedCar', JSON.stringify(selectedCar));
          setTimeout(() => {
            window.location.href = 'addon-extra.html';
          }, 400);
        } catch (err) {
          alert('Could not save selection. Please try again.');
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });
  }
});