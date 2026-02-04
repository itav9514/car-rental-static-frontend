(function ($) {
  "use strict";

  // Spinner
  var spinner = function () {
    setTimeout(function () {
      if ($('#spinner').length > 0) {
        $('#spinner').removeClass('show');
      }
    }, 1);
  };
  spinner(0);


  // Initiate the wowjs
  new WOW().init();


  // Sticky Navbar
  $(window).scroll(function () {
    if ($(this).scrollTop() > 200) {
      $('.sticky-top').addClass('shadow-sm').css('top', '0px');
    } else {
      $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
    }
  });


  // Car Categories
  $(".categories-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    dots: false,
    loop: true,
    margin: 25,
    nav: true,
    navText: [
      '<i class="fas fa-chevron-left"></i>',
      '<i class="fas fa-chevron-right"></i>'
    ],
    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },
      576: {
        items: 1
      },
      768: {
        items: 1
      },
      992: {
        items: 2
      },
      1200: {
        items: 3
      }
    }
  });


  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $('.back-to-top').fadeIn('slow');
    } else {
      $('.back-to-top').fadeOut('slow');
    }
  });
  $('.back-to-top').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
    return false;
  });


})(jQuery);




// ================================================
// DYNAMICALLY LOAD GOOGLE MAPS + PLACES API
// ================================================
function loadGoogleMapsAPI() {
  // Prevent loading multiple times
  if (window.google && window.google.maps && window.google.maps.places) {
    console.log("Google Maps API already loaded");
    initGooglePlaces(); // call your init function directly
    return;
  }

  // Create script element
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;

  // Your API key + libraries + callback
  script.src = "https://maps.googleapis.com/maps/api/js?" +
    "key=AIzaSyDVQMGq0Z3sW_SHPDWNEr8q9LzrVEXtR2o" +
    "&libraries=places" +
    "&callback=initGooglePlaces";

  // Optional: error handling
  script.onerror = () => {
    console.error("Failed to load Google Maps API");
    // You can show user message or fallback here
  };

  // Append to head or body
  document.head.appendChild(script);
}

// Call this when you need it (e.g. on page load)
loadGoogleMapsAPI();

// ================================================
// YOUR GOOGLE PLACES INIT FUNCTION
// (Google will automatically call this when script loads)
// ================================================
function initGooglePlaces() {
  console.log("Google Maps API loaded successfully");

  let pickupAutocomplete, dropoffAutocomplete;

  const pickupInput = document.querySelector("#pickup-location");
  if (pickupInput) {
    pickupAutocomplete = new google.maps.places.Autocomplete(pickupInput, {
      // no types, no restrictions
    });

    pickupAutocomplete.addListener("place_changed", () => {
      const place = pickupAutocomplete.getPlace();
      if (!place.geometry) {
        console.log("No details for input:", place.name || '—');
        return;
      }
      console.log("Pickup:", {
        name: place.name || '—',
        address: place.formatted_address || '—',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
    });
  }

  const dropoffInput = document.querySelector("#dropoff-location");
  if (dropoffInput) {
    dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, {
      // no types, no restrictions
    });

    dropoffAutocomplete.addListener("place_changed", () => {
      const place = dropoffAutocomplete.getPlace();
      if (place.geometry) {
        console.log("Dropoff:", {
          name: place.name || '—',
          address: place.formatted_address || '—',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    });
  }
}


// document.addEventListener('DOMContentLoaded', () => {

//   document.getElementById('pickup-time').addEventListener('change', function () {
//   const [h, m] = this.value.split(':').map(Number);
//   const rounded = Math.round(m / 15) * 15;
//   this.value = `${String(h).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}`;
// });

//   document.getElementById('dropoff-time').addEventListener('change', function () {
//   const [h, m] = this.value.split(':').map(Number);
//   const rounded = Math.round(m / 15) * 15;
//   this.value = `${String(h).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}`;
// });

// });








// Result & Search Page Logic

document.addEventListener('DOMContentLoaded', () => {
  const isSearchPage = document.getElementById('searchForm') !== null;
  const isResultPage = document.getElementById('car-container') !== null;
  const isAddOnPage = document.querySelector('.addon-services') !== null;


  // ────────────────────────────────────────────────
  // SHARED CONSTANTS
  // ────────────────────────────────────────────────
  const DEFAULT_PICKUP = {
    formatted_address: "Los Angeles International Airport (LAX), World Way, Los Angeles, CA 90045, USA",
    name: "Los Angeles International Airport (LAX)",
    geometry: { location: { lat: 33.9416, lng: -118.4085 } }
  };

  const DEFAULT_DROPOFF = {
    formatted_address: "Downtown Los Angeles, Los Angeles, CA 90012, USA",
    name: "Downtown Los Angeles",
    geometry: { location: { lat: 34.0522, lng: -118.2437 } }
  };

  // ────────────────────────────────────────────────
  // SEARCH PAGE LOGIC
  // ────────────────────────────────────────────────
  if (isSearchPage) {
    const form = document.getElementById('searchForm');
    const sameRadio = document.getElementById('sameDropoff');
    const diffRadio = document.getElementById('differentDropoff');
    const dropoffGroup = document.getElementById('dropoff-group');
    const dropoffLocation = document.getElementById('dropoff-location');
    const dateDisplay = document.getElementById('pickup-date-display');
    const pickupTime = document.getElementById('pickup-time');
    const dropoffTime = document.getElementById('dropoff-time');
    const pickupLocInput = document.getElementById('pickup-location');
    const submitBtn = form.querySelector('button[type="submit"]');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 365);

    const picker = new Litepicker({
      element: dateDisplay,
      singleMode: false,
      format: 'DD MMM YYYY',
      delimiter: ' → ',
      autoApply: true,
      numberOfColumns: 1,
      numberOfMonths: 1,
      minDate: today,
      maxDate: maxDate,
      allowRepick: true,
      parentEl: document.body,
      mobileFriendly: true,
    });


    const updateDateDisplay = () => {
      const start = picker.getStartDate();
      const end = picker.getEndDate();
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
          if (!isNaN(pDt)) pickupTime.value = pDt.toTimeString().slice(0, 5);
        }
        if (data.dropoffDateTime) {
          const dDt = new Date(data.dropoffDateTime);
          if (!isNaN(dDt)) dropoffTime.value = dDt.toTimeString().slice(0, 5);
        }

        if (data.pickupDateTime && data.dropoffDateTime) {
          const startDate = new Date(data.pickupDateTime);
          const endDate = new Date(data.dropoffDateTime);
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

      // submitBtn.disabled = true;
      // submitBtn.textContent = 'Searching...';

      const start = picker.getStartDate();
      const end = picker.getEndDate();

      if (!start || !end) {
        alert('Please select both pickup and return dates');
        resetButton();
        return;
      }

      const startJS = start.toJSDate();
      const endJS = end.toJSDate();

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

      const bookingData = {
        pickupLocation: pickupLoc || DEFAULT_PICKUP.formatted_address,
        dropoffLocation: isSame
          ? (pickupLoc || DEFAULT_PICKUP.formatted_address)
          : (dropoffLocation?.value.trim() || DEFAULT_DROPOFF.formatted_address),
        sameDropoff: isSame,
        pickupDateTime: `${start.format('YYYY-MM-DD')}T${pickupTime.value || '09:00'}`,
        dropoffDateTime: `${end.format('YYYY-MM-DD')}T${dropoffTime.value || '17:00'}`,
        searchTimestamp: new Date().toISOString(),
      };

      try {
        localStorage.setItem('lastCarRentalSearch', JSON.stringify(bookingData));

        // ── CHANGED: pass parameters in URL ────────────────────────────────
        const params = new URLSearchParams({
          pickup: bookingData.pickupLocation,
          dropoff: bookingData.dropoffLocation,
          pickupDt: bookingData.pickupDateTime,
          dropoffDt: bookingData.dropoffDateTime
        });

        if (!isAddOnPage) {
          window.location.href = 'result.html?' + params.toString();
        }
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


  // ── On result page ────────────────────────────────────────
  if (isResultPage) {

    console.log("✅ Dynamic car loading STARTED");

    // ── Read search parameters from URL ─────────────────────
    const urlParams = new URLSearchParams(window.location.search);

    const pickupAddr = urlParams.get('pickup') || DEFAULT_PICKUP.formatted_address;
    const dropoffAddr = urlParams.get('dropoff') || DEFAULT_DROPOFF.formatted_address;
    const pickupDtStr = urlParams.get('pickupDt') || null;
    const dropoffDtStr = urlParams.get('dropoffDt') || null;

    let totalHours = 72;  // fallback 3 days
    let totalDays = 3;

    if (pickupDtStr && dropoffDtStr) {
      const start = new Date(pickupDtStr);
      const end = new Date(dropoffDtStr);
      if (!isNaN(start) && !isNaN(end) && end > start) {
        const diffMs = end - start;
        totalHours = Math.ceil(diffMs / (1000 * 60 * 60));
        totalDays = Math.ceil(totalHours / 24);
      }
    }

    console.log(`Booking duration: ${totalDays} days (${totalHours} hours)`);

    // ── Rough distance estimation (replace with real API later) ──
    function estimateDistanceKm(a, b) {
      // Very basic heuristic – improve with Google Distance Matrix later
      if ((a.includes("Airport") || a.includes("LAX")) &&
        (b.includes("Downtown") || b.includes("Los Angeles"))) {
        return 25; // LAX → Downtown LA ≈ 25–30 km
      }
      return 80; // fallback
    }

    const distanceKm = estimateDistanceKm(pickupAddr, dropoffAddr);
    console.log(`Estimated distance: ${distanceKm} km`);

    // ── Fetch cars from backend ───────────────────────────────
    async function loadCars() {
      try {
        const response = await fetch('/cms/cms/car_cms/cars/');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const cars = await response.json();
        console.log("Loaded cars from API:", cars.length);

        const container = document.getElementById('car-container');
        const loading = document.getElementById('loading');
        const noResults = document.getElementById('no-results');

        loading.style.display = 'none';

        if (cars.length === 0) {
          noResults.style.display = 'block';
          return;
        }

        container.style.display = 'block';

        cars.forEach(car => {
          // Calculate real price
          const baseHourly = car.hourly_rate || 0;
          let rentalCost = baseHourly * totalHours;

          // Add fuel cost estimation
          if (car.mileage && distanceKm > 0) {
            // Parse mileage – e.g. "9.1 l/100km" → liters per 100 km
            const match = car.mileage.match(/[\d.]+/);
            if (match) {
              const litersPer100km = parseFloat(match[0]);
              const totalLiters = (distanceKm / 100) * litersPer100km;
              const fuelPricePerLiter = 1.2; // USD/L – adjust or make dynamic
              const fuelCost = totalLiters * fuelPricePerLiter;
              rentalCost += fuelCost;
            }
          }

          const finalPrice = Math.round(rentalCost * 100) / 100;

          // Build HTML card
          const cardHTML = `
              <div class="car-result" id="car-${car.id}" data-car-id="${car.id}">
                <div class="rst-1">
                  <img src="${car.image_url || 'img/placeholder-car.jpg'}" alt="${car.name}" />
                </div>
                <div class="rst-2">
                  <h2>${car.name}</h2>
                  <p>${car.display_category || ''}</p>


                  <div class="person-all">
  ${car.seats ? `
    <span data-feature="seats" data-value="${car.seats}">
      <img src="img/person.png" alt="" /> ${car.seats}
    </span>` : ''}

  ${car.luggage ? `
    <span data-feature="luggage" data-value="${car.luggage}">
      <img src="img/feature_suitcase.png" alt="" /> ${car.luggage}
    </span>` : ''}

  ${car.transmission ? `
    <span data-feature="transmission"
          data-value="${car.transmission_display || car.transmission}">
      <img src="img/feature_transmission.png" alt="" />
      ${car.transmission_display || car.transmission}
    </span>` : ''}

  ${car.fuel_type ? `
    <span data-feature="fuel"
          data-value="${car.fuel_type_display || car.fuel_type}">
      <img src="img/feature_fuel.png" alt="" />
      ${car.fuel_type_display || car.fuel_type}
    </span>` : ''}

  ${car.mileage ? (
              car.fuel_type === 'Electric' || car.fuel_type_display === 'Electric'
                ? `
      <span data-feature="battery"
            data-value="${car.mileage}"
            data-unit="mi/charge">
        <img src="img/feature_battery.png" alt="" />
        ${car.mileage} mi/charge
      </span>`
                : `
      <span data-feature="mileage"
            data-value="${car.mileage}"
            data-unit="mi/l">
        <img src="img/feature_fuel.png" alt="" />
        ${car.mileage} mi/l
      </span>`
            ) : ''}
</div>


                </div>
                <div class="rst-3">
                  <strong>${finalPrice.toFixed(2)} <span>USD (${totalDays} days)</span></strong>
                  <button class="continue-btn">Continue</button>
                </div>
              </div>
            `;

          container.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Now attach continue button listeners
        attachContinueListeners();

      } catch (err) {
        console.error("Failed to load cars:", err);
        document.getElementById('loading').innerHTML = '<p style="color:red;">Error loading vehicles. Please try again later.</p>';
      }
    }

    // ── Continue button logic (same as before, but now dynamic) ──
    function attachContinueListeners() {
      document.querySelectorAll('.continue-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const card = e.target.closest('.car-result');
          if (!card) return;

          button.disabled = true;
          button.textContent = 'Loading...';

          const carId = card.dataset.carId;
          const car = document.querySelector(`#car-${carId}`);
          if (!car) return;

          const title = car.querySelector('h2')?.textContent.trim() || 'Unknown';
          const subtitle = car.querySelector('p')?.textContent.trim() || '';
          const priceEl = car.querySelector('.rst-3 strong');
          const priceText = priceEl?.textContent.trim() || '0';
          const priceNum = parseFloat(priceText.match(/[\d.]+/)?.[0] || '0');

          const features = [];

          car.querySelectorAll('.person-all span').forEach(span => {
            const feature = span.dataset.feature;
            const value = span.dataset.value;
            const unit = span.dataset.unit || null;

            if (!feature || !value) return;

            features.push({
              type: feature,
              value: value,
              unit: unit,
              display: span.textContent.trim()
            });
          });


          const selectedCar = {
            id: carId,
            name: title,
            category: subtitle,
            priceTotal: priceNum,
            currency: 'USD',
            durationDays: totalDays,
            durationHours: totalHours,
            features,
            imageUrl: car.querySelector('img')?.src || '',
            selectedAt: new Date().toISOString()
          };

          try {
            localStorage.setItem('selectedCar', JSON.stringify(selectedCar));
            setTimeout(() => {
              window.location.href = 'addon-extra.html';
            }, 400);
          } catch (err) {
            console.error("Save failed:", err);
            alert('Could not save selection.');
            button.disabled = false;
            button.textContent = 'Continue';
          }
        });
      });
    }

    // Load cars when page is ready
    loadCars();
  }


});








// Add-on Extras Page Logic
document.addEventListener('DOMContentLoaded', () => {
  const isPayNowPage = document.getElementById('pay-now-btn') !== null;

  // ─── API Endpoints ─────────────────────────────────────
  const API_BASE = '/cms/cms/car_cms/';  // Change if your API prefix is different
  const ADDON_API = `${API_BASE}cars/`;

  // ─── Helpers ───────────────────────────────────────────
  const getDays = () => {
    const search = JSON.parse(localStorage.getItem('lastCarRentalSearch') || '{}');
    if (!search.pickupDateTime || !search.dropoffDateTime) return 7;
    const start = new Date(search.pickupDateTime);
    const end = new Date(search.dropoffDateTime);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  const days = getDays();

  const formatPrice = (num) => {
    const parsed = parseFloat(num);
    return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
  };
  const saveCart = (cart) => localStorage.setItem('addonCart', JSON.stringify(cart));
  const loadCart = () => JSON.parse(localStorage.getItem('addonCart') || '[]');

  const isPriceKnown = (price) => price !== null && price > 0;

  // Safe HTML rendering (prevents XSS)
  const safeHTML = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.innerHTML;  // or use DOMPurify if you include it
  };

  // ─── Load Selected Car from localStorage ───────────────
  const selectedCar = JSON.parse(localStorage.getItem('selectedCar') || '{}');
  const carId = selectedCar?.id;

  if (!carId) {
    console.warn("No car selected in localStorage");
    // Show warning in UI
    document.getElementById('your-car-section').innerHTML = `
      <h2>No Car Selected</h2>
      <p>Please go back and select a vehicle.</p>
      <a href="result.html" class="btn btn-outline-primary">← Back to Cars</a>
    `;
  }

  // ─── Render Your Car Section ───────────────────────────
  const renderYourCar = () => {
    const section = document.getElementById('your-car-section');
    if (!section || !carId) return;

    section.innerHTML = `
      <img src="${selectedCar.imageUrl || 'img/placeholder-car.jpg'}" alt="${selectedCar.name}" style="width:100%; height:auto; object-fit:cover; border-radius:8px;">
      <h2>Your Car</h2>
      <hr>
      <strong>${selectedCar.name}</strong>
      <p>${selectedCar.display_category || 'Similar vehicle'}</p>
      <div style="font-size:0.9em; color:#555; margin-top:10px;">
        ${selectedCar.features?.map(f => `<span class="badge bg-light text-dark me-1">${f.value}</span>`).join('') || ''}
      </div>
    `;
  };





  // ─── Load & Render Add-ons for the Selected Car ────────────────
  const loadAndRenderAddons = async () => {
    if (!carId) {
      console.warn("No car ID available — skipping add-on loading");
      return;
    }

    const container = document.getElementById('addons-container');
    if (!container) {
      console.error("Container #addons-container not found");
      return;
    }

    const loadingEl = document.getElementById('addons-loading');
    if (loadingEl) loadingEl.style.display = 'block';

    try {
      const url = `${API_BASE}cars/${carId}/`;
      console.log("Fetching from:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Full car response:", data);

      // Extract addons and convert price to number
      const addons = Array.isArray(data.addons) ? data.addons.map(addon => ({
        ...addon,
        price: addon.price !== null ? parseFloat(addon.price) : null  // Convert to number or null
      })) : [];

      console.log(`Successfully loaded ${addons.length} add-on(s) for car ID ${carId}`);

      // Hide loading
      if (loadingEl) loadingEl.style.display = 'none';
      container.innerHTML = '';

      if (addons.length === 0) {
        container.innerHTML = '<p class="text-center py-5 text-muted">No add-ons available for this vehicle.</p>';
        return;
      }

      // Group into rows of 2
      for (let i = 0; i < addons.length; i += 2) {
        const row = document.createElement('div');
        row.className = 'extra-all row';

        const group = addons.slice(i, i + 2);

        group.forEach(addon => {
          const cart = loadCart();
          const inCart = cart.some(item => item.id === addon.id);

          // Use numeric price for display
          const displayPrice = isPriceKnown(addon.price)
            ? `${formatPrice(addon.price)} ${addon.type === 'day' ? '/ Day' : 'per rental'}`
            : 'Price at counter';

          const modalId = `addon-modal-${addon.id}`;

          const modalHTML = `
          <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="${modalId}Label">${addon.name}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                  ${addon.image_url ? `
                    <img src="${addon.image_url}" alt="${addon.name}" class="img-fluid mb-4 rounded shadow-sm" style="max-height:350px; width:100%; object-fit:cover;">
                  ` : ''}
                  <p class="lead mb-4">${addon.brief_description || '<em>No brief description available</em>'}</p>
                  <div class="detailed-description mb-4">
                    ${safeHTML(addon.detailed_description || '<p>No detailed information provided.</p>')}
                  </div>
                  <hr class="my-4">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong class="fs-5">${displayPrice}</strong>
                      <small class="text-muted d-block">Type: ${addon.type || 'N/A'}</small>
                    </div>
                    <small class="text-muted">Updated: ${new Date(addon.updated_at).toLocaleDateString()}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

          const addonCard = `
          <div class="addon-services col-lg-6 ${inCart ? 'addon-selected' : ''}">
            ${addon.image_url
              ? `<img src="${addon.image_url}" alt="${addon.name}" />`
              : '<img src="img/placeholder-addon.jpg" alt="Add-on" />'}
            
            <h2>${addon.name}</h2>
            <p>${addon.brief_description || 'No short description available'}</p>
            
            <a style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#${modalId}">
              More Details
            </a>
            
            <strong>${displayPrice}</strong>
            
            <button class="addon-btn ${inCart ? 'btn-outline-danger' : 'btn-outline-primary'}" 
                    data-id="${addon.id}"
                    data-name="${addon.name.replace(/"/g, '&quot;')}"
                    data-price="${addon.price !== null ? addon.price : 0}"
                    data-type="${addon.type || 'rental'}">
              ${inCart ? 'Remove' : 'Add'}
            </button>
          </div>
          ${modalHTML}
        `;

          row.insertAdjacentHTML('beforeend', addonCard);
        });

        container.appendChild(row);
      }

      // Re-attach listeners and refresh totals
      attachAddonListeners();
      renderPriceDetails();

    } catch (err) {
      console.error("Failed to load add-ons:", err);
      container.innerHTML = `
      <div class="alert alert-danger text-center py-5">
        <strong>Error loading add-ons</strong><br>
        ${err.message}<br>
        <button class="btn btn-outline-danger mt-3" onclick="location.reload()">Retry</button>
      </div>
    `;
    }
  };



  // ─── Add/Remove Logic ──────────────────────────────────

  const toggleAddon = (btn) => {
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price) || 0;  // always number
    const type = btn.dataset.type || 'rental';

    if (!id) return alert('Add-on information missing.');

    let cart = loadCart();
    const index = cart.findIndex(item => item.id === id);

    if (index === -1) {
      cart.push({ id, name, price, type });
      btn.textContent = 'Remove';
      btn.classList.replace('btn-outline-primary', 'btn-outline-danger');
    } else {
      cart.splice(index, 1);
      btn.textContent = 'Add';
      btn.classList.replace('btn-outline-danger', 'btn-outline-primary');
    }

    saveCart(cart);
    renderPriceDetails();
  };

  const attachAddonListeners = () => {
    document.querySelectorAll('.addon-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAddon(btn);
      });
    });

    // Remove from price list
    document.addEventListener('click', e => {
      if (e.target.closest('.remove-addon')) {
        const btn = e.target.closest('.remove-addon');
        const id = btn.dataset.id;
        let cart = loadCart();
        cart = cart.filter(item => item.id !== id);
        saveCart(cart);
        renderPriceDetails();

        // Sync original button
        const original = document.querySelector(`.addon-btn[data-id="${id}"]`);
        if (original) {
          original.textContent = 'Add';
          original.classList.replace('btn-outline-danger', 'btn-outline-primary');
        }
      }
    });
  };

  // ─── Price Rendering ───────────────────────────────────

  const renderPriceDetails = () => {
    const cart = loadCart();
    const listEl = document.getElementById('addons-list');
    const totalEl = document.getElementById('grand-total');
    if (!listEl || !totalEl) return;

    listEl.innerHTML = '';

    let addonsTotal = 0;

    cart.forEach(item => {
      // Ensure price is always a number
      const price = isPriceKnown(item.price) ? parseFloat(item.price) : 0;
      const calcPrice = item.type === 'day' ? price * days : price;
      addonsTotal += calcPrice;

      const display = isPriceKnown(item.price) ? formatPrice(calcPrice) : 'TBD';

      listEl.innerHTML += `
      <div class="dtl addon-row">
        <span>${item.name} ${item.type === 'day' ? `× ${days} days` : '(per rental)'}</span>
        <strong>${display} USD</strong>
        <button class="remove-addon btn btn-sm text-danger ms-2" data-id="${item.id}">
          <i class="fas fa-minus-circle"></i>
        </button>
      </div>
    `;
    });

    const grand = parseFloat(selectedCar.priceTotal || 0) + addonsTotal;
    totalEl.textContent = `${formatPrice(grand)} USD`;
  };

  // ─── Continue Button ───────────────────────────────────
  const continueBtn = document.getElementById('continue-to-payment');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const cart = loadCart();
      if (cart.length === 0 && !confirm('No add-ons selected. Continue?')) return;

      const finalData = {
        car: selectedCar,
        addons: cart,
        days,
        basePrice: parseFloat(selectedCar.priceTotal || 0),
        addonsTotal: parseFloat(document.getElementById('grand-total')?.textContent?.replace(/[^0-9.]/g, '') || 0) - parseFloat(selectedCar.priceTotal || 0),
        total: document.getElementById('grand-total')?.textContent || '0.00 USD',
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('bookingSummary', JSON.stringify(finalData));
      window.location.href = 'payment.html'; // or your next step
    });
  }

  // ─── Start Everything ──────────────────────────────────
  renderYourCar();
  loadAndRenderAddons();
});









// Payment Page Logic
document.addEventListener('DOMContentLoaded', () => {
  console.log("Payment page loaded. Checking localStorage...");

  // Debug: show what's actually stored
  console.log("lastCarRentalSearch:", localStorage.getItem('lastCarRentalSearch'));
  console.log("selectedCar:", localStorage.getItem('selectedCar'));
  console.log("addonCart:", localStorage.getItem('addonCart'));

  // ─── Helpers ───────────────────────────────────────────────
  const formatPrice = (num) => (typeof num === 'number' && !isNaN(num)) ? num.toFixed(2) : '—';

  const daysBetween = (startStr, endStr) => {
    if (!startStr || !endStr) return 7;
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (isNaN(start) || isNaN(end)) return 7;
      const diff = end - start;
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch (e) {
      console.warn("Date parsing failed:", e);
      return 7;
    }
  };

  // Date in MM/DD/YYYY + Time in 24-hour format
  function formatUSDate24Hour(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';

    const usDate = date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });

    const time24 = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${usDate} ${time24}`;
  }

  // ─── Load & Display Data ───────────────────────────────────
  const displayBookingSummary = () => {
    let search = {};
    let car = {};
    let addons = [];

    try {
      search = JSON.parse(localStorage.getItem('lastCarRentalSearch') || '{}');
      car = JSON.parse(localStorage.getItem('selectedCar') || '{}');
      addons = JSON.parse(localStorage.getItem('addonCart') || '[]');
    } catch (err) {
      console.error("Failed to parse localStorage data:", err);
    }


    if (search) {
      // Pick-up location (always shown)
      document.getElementById('pickup-location-text').textContent =
        search.pickupLocation || '—';

      // Pick-up & Drop-off times (always shown)
      document.getElementById('pickup-time-text').textContent =
        formatUSDate24Hour(search.pickupDateTime);
      document.getElementById('dropoff-time-text').textContent =
        formatUSDate24Hour(search.dropoffDateTime);

      // ─── Handle Drop-off Location conditionally ────────────────────────
      const dropoffGroup = document.getElementById('dropoff-location-group');
      const dropoffText = document.getElementById('dropoff-location-text');

      if (search.sameDropoff === false && search.dropoffLocation) {
        console.log("Different drop-off location detected:", search.dropoffLocation);
        // Different drop-off → show it
        dropoffGroup.style.display = 'block';
        dropoffText.textContent = search.dropoffLocation;
      } else {
        // Same location or missing data → hide the drop-off location row
        dropoffGroup.style.display = 'none';
        dropoffText.textContent = '—'; // optional cleanup
      }
    }


    function getFeatureIcon(feature) {
      switch (feature.type) {
        case 'seats':
          return 'img/person.png';

        case 'luggage':
          return 'img/feature_suitcase.png';

        case 'transmission':
          return 'img/feature_transmission.png';

        case 'fuel':
          return 'img/feature_fuel.png';

        case 'battery':
          return 'img/feature_battery.png';

        case 'mileage':
          return 'img/feature_fuel.png';

        default:
          return '';
      }
    }


    function renderCarFeatures(features = []) {
      if (!Array.isArray(features) || features.length === 0) {
        return '';
      }

      return `
          <div class="person-all" >
            ${features.map(f => `
              <span>
                <img src="${getFeatureIcon(f)}" alt="" />
                ${f.display || `${f.value}${f.unit ? ' ' + f.unit : ''}`}
              </span>
            `).join('')}
          </div>
        `;
    }


    const carSection = document.getElementById('your-car-section');


    if (carSection) {
      if (car.name || car.id) {
        carSection.innerHTML = `
            <img src="${car.imageUrl || 'img/tesla.jpg'}" alt="${car.name || 'Vehicle'}">

            <h2>Your Car</h2>
            <hr>

            <strong>${car.name || 'Selected Vehicle'}</strong>
            <p>${car.description || car.category || 'Similar vehicle'}</p>

            ${renderCarFeatures(car.features)}
          `;
      } else {
        carSection.innerHTML = `
            <p>
              <strong>No car selected.</strong>
              Please go back and choose a vehicle.
            </p>`;
      }
    }


    // 3. Price Details
    const days = daysBetween(search.pickupDateTime, search.dropoffDateTime);

    let basePrice = Number(car.priceTotal) || Number(car.totalPrice) || 0;

    // Fallback (only if you really don't have pre-calculated total)
    if (basePrice === 0 && car.pricePerWeek > 0) {
      const daily = Number(car.pricePerWeek) / 7;
      basePrice = daily * days;
    }

    let pricedAddonsTotal = 0;
    const addonsListEl = document.getElementById('addons-list');
    if (addonsListEl) {
      addonsListEl.innerHTML = '';

      if (addons.length === 0) {
        addonsListEl.innerHTML = '<div class="dtl"><span>No extras selected</span><strong>—</strong></div>';
      }

      addons.forEach(item => {
        const isKnown = Number(item.price) > 0;
        const itemPrice = isKnown
          ? (item.type === 'day' ? Number(item.price) * days : Number(item.price))
          : 0;

        if (isKnown) pricedAddonsTotal += itemPrice;

        const row = document.createElement('div');
        row.className = 'dtl';
        row.innerHTML = `
          <span>${item.name || 'Unnamed Add-on'} ${item.type === 'day' ? `× ${days} days` : '(per rental)'}</span>
          <strong>${isKnown ? formatPrice(itemPrice) + ' USD' : '—'}</strong>
        `;
        addonsListEl.appendChild(row);
      });
    }


    // Base price row
    const baseRow = document.getElementById('base-price-row');
    if (baseRow) {
      baseRow.innerHTML = basePrice > 0
        ? `<span>Car Rent Cost(${days} days)</span><strong>${formatPrice(basePrice)} USD</strong>`
        : `<span>Base Rental Price</span><strong>To be confirmed</strong>`;
    }

    // Grand total
    const grandTotalEl = document.getElementById('grand-total');
    if (grandTotalEl) {
      const total = basePrice + pricedAddonsTotal;
      grandTotalEl.textContent = formatPrice(total) + ' USD';
    }



    window.__pricing = {
      days,
      basePrice,
      addonsTotal: pricedAddonsTotal,
      grandTotal: basePrice + pricedAddonsTotal,
      currency: car.currency || 'USD'
    };


  };

  // ─── Custom JS Validation ──────────────────────────────────
  const validateForm = () => {
    const errors = [];

    // First Name
    const firstName = document.getElementById('firstName');
    if (!firstName.value.trim() || !/^[A-Za-z\s]+$/.test(firstName.value.trim())) {
      errors.push('First name is required and should contain letters and spaces only.');
    }

    // Last Name
    const lastName = document.getElementById('lastName');
    if (!lastName.value.trim() || !/^[A-Za-z\s]+$/.test(lastName.value.trim())) {
      errors.push('Last name is required and should contain letters and spaces only.');
    }

    // Email
    const email = document.getElementById('email');
    if (!email.value.trim() || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value.trim())) {
      errors.push('A valid email address is required.');
    }

    // Country Code
    const countryCode = document.getElementById('countryCode');
    if (!countryCode.value.trim()) {
      errors.push('Please select a country code.');
    }

    // Phone
    const phone = document.getElementById('phone');
    if (!phone.value.trim() || !/^[0-9]{7,15}$/.test(phone.value.trim())) {
      errors.push('Phone number is required and should be 7-15 digits.');
    }

    // Driving License
    const drivingLicense = document.getElementById('drivingLicense');
    if (!drivingLicense.value.trim() || !/^[A-Za-z0-9 \-]+$/.test(drivingLicense.value.trim())) {
      errors.push('Driving license is required and should contain letters, numbers, spaces, or hyphens.');
    }

    // Driver Age
    const driverAge = document.getElementById('driverAge');
    const ageValue = parseInt(driverAge.value, 10);
    if (isNaN(ageValue) || ageValue < 18 || ageValue > 60) {
      errors.push('Driver age is required and must be a number between 18 and 60.');
    }

    // Card Holder
    const cardHolder = document.getElementById('cardHolder');
    if (!cardHolder.value.trim() || !/^[A-Za-z\s]+$/.test(cardHolder.value.trim())) {
      errors.push('Card holder name is required and should contain letters and spaces only.');
    }

    // Card Number
    const cardNumber = document.getElementById('cardNumber');
    const cleanedCard = cardNumber.value.trim().replace(/\s/g, '');
    if (!cleanedCard || !/^\d{16}$/.test(cleanedCard)) {
      errors.push('Card number is required and should be exactly 16 digits (spaces optional).');
    }

    // Expiry Month
    const expiryMonth = document.getElementById('expiryMonth');
    if (!expiryMonth.value.trim() || isNaN(parseInt(expiryMonth.value, 10)) || parseInt(expiryMonth.value, 10) < 1 || parseInt(expiryMonth.value, 10) > 12) {
      errors.push('Please select a valid expiry month.');
    }

    // Expiry Year
    const expiryYear = document.getElementById('expiryYear');
    const currentYear = new Date().getFullYear();
    if (!expiryYear.value.trim() || isNaN(parseInt(expiryYear.value, 10)) || parseInt(expiryYear.value, 10) < currentYear) {
      errors.push('Please select a valid expiry year (must be current or future).');
    }

    // CVV
    const cvv = document.getElementById('cvv');
    if (!cvv.value.trim() || !/^\d{3,4}$/.test(cvv.value.trim())) {
      errors.push('CVV is required and should be 3 or 4 digits.');
    }

    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return false;
    }
    return true;
  };

  // ─── Pay Now Handler ───────────────────────────────────────
  const handlePayment = async () => {
    const payBtn = document.getElementById('pay-now-btn');
    if (!payBtn) return;

    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';

    // Custom JS validation (in case HTML validation is bypassed)
    if (!validateForm()) {
      payBtn.disabled = false;
      payBtn.textContent = 'Pay Now';
      return;
    }

    // Get data from localStorage
    let searchData = {};
    let carData = {};
    let addonsData = [];

    try {
      searchData = JSON.parse(localStorage.getItem('lastCarRentalSearch') || '{}');
      carData = JSON.parse(localStorage.getItem('selectedCar') || '{}');
      addonsData = JSON.parse(localStorage.getItem('addonCart') || '[]');
    } catch (err) {
      console.error("Failed to parse localStorage:", err);
    }


    let seats = null;
    let doors = null;
    let transmission = null;
    let fuelType = null;
    let mileage = null;
    let luggage = null;

    (carData.features || []).forEach(f => {
      switch (f.type) {
        case 'seats':
          seats = Number(f.value) || null;
          break;

        case 'doors':
          doors = Number(f.value) || null;
          break;

        case 'transmission':
          transmission = f.value || null;
          break;

        case 'fuel':
          fuelType = f.value || null;
          break;

        case 'luggage':
          luggage = f.value || null;
          break;


        case 'battery':
        case 'mileage':
          // 🔥 battery range OR fuel mileage → single mileage field
          mileage = f.unit ? `${f.value} ${f.unit}` : f.value;
          break;
      }
    });




    // Collect form data using IDs
    const formData = {
      firstName: document.getElementById('firstName')?.value.trim() || '',
      lastName: document.getElementById('lastName')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      countryCode: document.getElementById('countryCode')?.value.trim() || '',  // Added country code
      phone: document.getElementById('phone')?.value.trim() || '',
      drivingLicenseNumber: document.getElementById('drivingLicense')?.value.trim() || '',
      driverAge: parseInt(document.getElementById('driverAge')?.value, 10) || null,  // Added driver age

      cardHolderName: document.getElementById('cardHolder')?.value.trim() || '',
      cardNumber: document.getElementById('cardNumber')?.value.trim().replace(/\s/g, '') || '',  // Clean spaces
      cardBrand: 'VISA',

      expiryMonth: (() => {
        const val = document.getElementById('expiryMonth')?.value.trim();
        return val && !isNaN(val) ? Number(val) : null;
      })(),

      expiryYear: (() => {
        const val = document.getElementById('expiryYear')?.value.trim();
        return val && !isNaN(val) ? Number(val) : null;
      })(),

      cvv: document.getElementById('cvv')?.value.trim() || '',

      // ─── FLATTENED FIELDS REQUIRED BY BACKEND ─────────────────────
      pickupLocation: searchData.pickupLocation || '',
      dropoffLocation: searchData.dropoffLocation || '',
      pickupDateTime: searchData.pickupDateTime || '',
      dropoffDateTime: searchData.dropoffDateTime || '',
      sameLocation: searchData.sameDropoff === true,

      carCategoryCode: carData.id || carData.categoryCode || carData.category || '',
      carName: carData.name || '',
      carDisplayCategory: carData.category || '',
      pricePerWeek: Number(carData.pricePerWeek) || 0,
      currency: carData.currency || 'USD',
      carImageUrl: carData.imageUrl || '',

      // ✅ MAPPED FEATURES
      seats: seats,
      doors: doors,
      transmission: transmission,
      fuelType: fuelType,
      mileage: mileage,   // ← battery OR mileage
      luggage: luggage,



      addons: addonsData.map(addon => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price) || 0,
        type: addon.type || 'rental'
      })),



      timestamp: new Date().toISOString()
    };

    const pricing = window.__pricing || {};

    formData.rentalDays = pricing.days || 0;
    formData.basePrice = pricing.basePrice || 0;
    formData.addonsTotal = pricing.addonsTotal || 0;
    formData.totalPrice = pricing.grandTotal || 0;
    formData.currency = pricing.currency || 'USD';

    // Simple client-side validation for required fields (expanded)
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.countryCode || !formData.driverAge) {
      alert('Please fill in all required personal details (name, email, phone, country code, driver age).');
      payBtn.disabled = false;
      payBtn.textContent = 'Pay Now';
      return;
    }

    if (!formData.carCategoryCode || !formData.carName) {
      alert('Car information is missing. Please go back and select a vehicle again.');
      payBtn.disabled = false;
      payBtn.textContent = 'Pay Now';
      return;
    }

    console.log("Sending to backend:", formData);

    try {
      const response = await fetch('/api/CarRentalEnquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // console.log("Server response status:", response.status);
      // console.log("Server response:", response);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error("Error details from server:", errorBody);
        throw new Error(`Server error: ${response.status} - ${errorBody.title || 'Validation failed'}`);
      }

      const result = await response.json();
      // alert('Booking successful! Reference: ' + (result.id || result.bookingId || '—'));

      sessionStorage.setItem(
        'carRentalEnquiry',
        JSON.stringify(result)
      );

      // Optional: cleanup
      localStorage.removeItem('addonCart');
      localStorage.removeItem('selectedCar');
      localStorage.removeItem('bookingSummary');
      localStorage.removeItem('lastCarRentalSearch');

      window.location.href = 'thankyou.html';

    } catch (err) {
      console.error("Payment/Booking error:", err);
      alert('Error: ' + err.message);
      payBtn.disabled = false;
      payBtn.textContent = 'Pay Now';
    }
  };

  // ─── Run ──────────────────────────────────────────────────
  displayBookingSummary();

  const form = document.getElementById('payment-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      console.log('Invalid fields:');
      [...form.elements].forEach(el => {
        if (!el.checkValidity()) {
          console.warn(el.id || el.name, el.validationMessage);
        }
      });

      form.reportValidity();
      return;
    }

    handlePayment();
  });
});