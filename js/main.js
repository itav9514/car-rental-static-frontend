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
  const isResultPage = document.querySelector('.car-result') !== null;
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
      numberOfColumns: 2,
      numberOfMonths: 2,
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
  if (isResultPage) {

    console.log("✅ Result page logic STARTED");
    console.log("Found car cards:", document.querySelectorAll('.car-result').length);
    console.log("Found continue buttons:", document.querySelectorAll('.continue-btn').length);

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        console.log("Page restored from bfcache → reloading");
        window.location.reload();
      }
    });

    // ── Read search parameters ────────────────────────────────
    const urlParams = new URLSearchParams(window.location.search);

    const pickupAddr = urlParams.get('pickup') || DEFAULT_PICKUP.formatted_address;
    const dropoffAddr = urlParams.get('dropoff') || DEFAULT_DROPOFF.formatted_address;
    const pickupTime = urlParams.get('pickupDt') || null;
    const dropoffTime = urlParams.get('dropoffDt') || null;

    let days = 3; // fallback
    let hours = 72;

    if (pickupTime && dropoffTime) {
      const start = new Date(pickupTime);
      const end = new Date(dropoffTime);
      if (!isNaN(start) && !isNaN(end) && end > start) {
        const diffMs = end - start;
        hours = Math.ceil(diffMs / (1000 * 60 * 60));
        days = Math.ceil(hours / 24);
      }
    }

    // Very simple distance estimation function (you can replace later)
    function estimateDistanceKm(a, b) {
      // Rough heuristic – real implementation needs Google Distance Matrix API
      if (a.includes("Airport") && b.includes("Cyber") ||
        b.includes("Airport") && a.includes("Cyber")) {
        return 35; // Delhi airport → Cyber Hub ≈ 35–40 km
      }
      // Default fallback
      return 80;
    }

    const distanceKm = estimateDistanceKm(pickupAddr, dropoffAddr);

    // ── Price calculation logic ────────────────────────────────
    function calculatePrice(baseWeeklyUsd, distanceKm, rentalHours) {
      const baseDaily = baseWeeklyUsd / 7;
      let price = baseDaily * (rentalHours / 24);

      // Add small distance surcharge (example: $0.35 per km)
      price += distanceKm * 0.35;

      // Round to 2 decimals
      return Math.round(price * 100) / 100;
    }

    // ── Update all displayed prices ────────────────────────────
    const carCards = document.querySelectorAll('.car-result');

    carCards.forEach(card => {
      const priceElement = card.querySelector('.rst-3 strong');
      if (!priceElement) {
        console.warn("No price <strong> in card", card.id || card);
        return;
      }

      // Extract original weekly price (fallback)
      const text = priceElement.textContent.trim();
      const weeklyMatch = text.match(/[\d,.]+/);
      const weeklyUsd = weeklyMatch ? parseFloat(weeklyMatch[0].replace(',', '')) : 500;
      console.log(`Updating ${card.id || 'card'} from ${weeklyUsd} → new price`);
      const newPrice = calculatePrice(weeklyUsd, distanceKm, hours);
      priceElement.innerHTML = `${newPrice.toFixed(2)} <span>USD/Week</span>`;


    });

    document.querySelectorAll('.continue-btn').forEach((button, index) => {
      console.log(`Attaching listener to button #${index + 1}`);
      button.addEventListener('click', (e) => {
        console.log(">>> Continue button clicked! Index:", index);

        const carCard = e.target.closest('.car-result');
        if (!carCard) {
          console.error("No .car-result parent found");
          return;
        }

        console.log("Car ID:", carCard.dataset.carId);

        button.disabled = true;
        const originalText = button.textContent;
        button.textContent = 'Loading...';

        const carId = carCard.dataset.carId
        const title = carCard.querySelector('h2')?.textContent.trim() || 'Unknown';
        const subtitle = carCard.querySelector('p')?.textContent.trim() || '';
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

        console.log("Selected car:", selectedCar);


        try {
          const jsonString = JSON.stringify(selectedCar);
          localStorage.setItem('selectedCar', jsonString);

          console.group("localStorage Save Verification");
          console.log("Original object:", selectedCar);
          console.log("Saved as JSON string:", jsonString);

          const retrieved = localStorage.getItem('selectedCar');
          console.log("Retrieved from localStorage:", retrieved);

          if (retrieved) {
            const parsedBack = JSON.parse(retrieved);
            console.log("Parsed back to object:", parsedBack);
            console.log("Objects match?", JSON.stringify(parsedBack) === jsonString);
          }
          console.groupEnd();

          console.log("Redirecting in 400ms...");
          setTimeout(() => {
            window.location.href = 'addon-extra.html';
          }, 400);
        } catch (err) {
          console.error("Save failed:", err);
          alert('Could not save selection. Please try again.');
          button.disabled = false;
          button.textContent = originalText;
        }

      });
    });

    console.log("✅ Result page logic FINISHED");
  }
});





// Add-on Extras Page Logic

document.addEventListener('DOMContentLoaded', () => {

  const isPayNowPage = document.getElementById('pay-now-btn') !== null;

  // ─── Helpers ────────────────────────────────────────
  const getDays = () => {
    const search = JSON.parse(localStorage.getItem('lastCarRentalSearch') || '{}');
    if (!search.pickupDateTime || !search.dropoffDateTime) return 7;
    const start = new Date(search.pickupDateTime);
    const end = new Date(search.dropoffDateTime);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  const days = getDays();
  const formatPrice = (num) => num.toFixed(2);

  const saveCart = (cart) => localStorage.setItem('addonCart', JSON.stringify(cart));
  const loadCart = () => JSON.parse(localStorage.getItem('addonCart') || '[]');

  const isPriceKnown = (price) => price > 0;

  // ─── Render Your Car + Base Price ───────────────────
  const renderYourCarAndBasePrice = () => {
    const car = JSON.parse(localStorage.getItem('selectedCar') || '{}');
    const carSection = document.getElementById('your-car-section');
    if (!carSection) return 0;

    let basePriceValue = 0;
    let basePriceHTML = '<div class="dtl"><span>Base rental price</span><strong>Calculated later</strong></div>';

    if (car.pricePerWeek && car.pricePerWeek > 0) {
      const dailyRate = car.pricePerWeek / 7;
      basePriceValue = dailyRate * days;
      basePriceHTML = `
        <div class="dtl" id="base-price-row">
          <span>Base Rental (${days} days @ ${formatPrice(dailyRate)}/day)</span>
          <strong>${formatPrice(basePriceValue)} USD</strong>
        </div>
      `;
    }

    carSection.innerHTML = car.id
      ? `
        <img src="${car.imageUrl || 'img/placeholder-car.jpg'}" alt="${car.name}">
        <h2>Your Car</h2>
        <hr>
        <strong>${car.name} ${car.category ? `(${car.category})` : ''}</strong>
        <p>${car.description || car.category || 'Similar vehicle'}</p>
      `
      : '<p>No car selected yet.</p>';

    const baseRow = document.getElementById('base-price-row');
    if (baseRow) baseRow.outerHTML = basePriceHTML;

    return basePriceValue;
  };

  // ─── Render Add-ons & Total ──────────────────────────
  const renderPriceDetails = (basePrice = 0) => {
    const cart = loadCart();
    const listEl = document.getElementById('addons-list');
    const totalEl = document.getElementById('grand-total');
    if (!listEl || !totalEl) return;

    listEl.innerHTML = '';

    let knownAddonsTotal = 0;

    cart.forEach(item => {
      const known = isPriceKnown(item.price);
      // const displayPrice = known
      //   ? (item.type === 'day' ? item.price * days : item.price)
      //   : '—';

      // if (known) knownAddonsTotal += Number(displayPrice);

      let calculatedPrice = 0;

      if (known) {
        calculatedPrice =
          item.type === 'day'
            ? item.price * days
            : item.price;

        knownAddonsTotal += calculatedPrice;
      }

      const displayPrice = known ? formatPrice(calculatedPrice) : '—';


      const row = document.createElement('div');
      row.className = 'dtl addon-row';
      row.innerHTML = `
        <span>${item.name} ${item.type === 'day' ? `× ${days} days` : '(per rental)'}</span>
        <strong>${displayPrice}${known ? ' USD' : ''}</strong>

  ${
    !isPayNowPage
      ? `
        <button
          class="remove-addon btn btn-sm text-danger ms-2"
          data-id="${item.id}"
          title="Remove add-on"
        >
          <i class="fas fa-minus-circle fa-lg"></i>
        </button>
      `
      : ''
  }

      `;
      listEl.appendChild(row);
    });

    const grandTotal = basePrice + knownAddonsTotal;
    totalEl.textContent = `${formatPrice(grandTotal)} USD`;
  };

  // ─── Toggle Add / Remove ─────────────────────────────
  const toggleAddon = (btn) => {
    const id = btn.dataset.id;
    const name = btn.dataset.name || 'Unnamed Add-on';
    const price = parseFloat(btn.dataset.price) || 0;
    const type = btn.dataset.type || 'rental';

    if (!id) {
      alert('Add-on is missing required information.');
      return;
    }

    let cart = loadCart();
    const index = cart.findIndex(item => item.id === id);

    if (index === -1) {
      // Add
      cart.push({ id, name, price, type });
      btn.textContent = 'Remove';
      btn.classList.remove('btn-outline-primary');
      btn.classList.add('btn-outline-danger');
    } else {
      // Remove
      cart.splice(index, 1);
      btn.textContent = 'Add';
      btn.classList.remove('btn-outline-danger');
      btn.classList.add('btn-outline-primary');
    }

    saveCart(cart);
    renderPriceDetails(basePriceFromCar);
  };

  // ─── Init ────────────────────────────────────────────
  const basePriceFromCar = renderYourCarAndBasePrice();
  renderPriceDetails(basePriceFromCar);

  // Set correct initial button states
  document.querySelectorAll('.addon-btn').forEach(btn => {
    const id = btn.dataset.id;
    if (!id) return;

    const inCart = loadCart().some(item => item.id === id);
    btn.textContent = inCart ? 'Remove' : 'Add';
    btn.classList.toggle('btn-outline-danger', inCart);
    btn.classList.toggle('btn-outline-primary', !inCart);

    btn.addEventListener('click', () => toggleAddon(btn));
  });

  // Delegate remove clicks
  // document.addEventListener('click', e => {
  //   if (!e.target.classList.contains('remove-addon')) return;
  //   const id = e.target.dataset.id;
  //   if (!id) return;

  //   let cart = loadCart();
  //   cart = cart.filter(item => item.id !== id);
  //   saveCart(cart);

  //   renderPriceDetails(basePriceFromCar);

  //   const originalBtn = document.querySelector(`.addon-btn[data-id="${id}"]`);
  //   if (originalBtn) {
  //     originalBtn.textContent = 'Add';
  //     originalBtn.classList.remove('btn-outline-danger');
  //     originalBtn.classList.add('btn-outline-primary');
  //   }
  // });


  document.addEventListener('click', e => {
    const removeBtn = e.target.closest('.remove-addon');
    if (!removeBtn) return;

    const id = removeBtn.dataset.id;
    if (!id) return;

    let cart = loadCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);

    renderPriceDetails(basePriceFromCar);

    const originalBtn = document.querySelector(`.addon-btn[data-id="${id}"]`);
    if (originalBtn) {
      originalBtn.textContent = 'Add';
      originalBtn.classList.remove('btn-outline-danger');
      originalBtn.classList.add('btn-outline-primary');
    }
  });



  // Continue button logic (if you have the button)
  const continueBtn = document.getElementById('continue-to-payment');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const cart = loadCart();
      if (cart.length === 0 && !confirm('No extras selected. Proceed anyway?')) return;

      const finalData = {
        search: JSON.parse(localStorage.getItem('lastCarRentalSearch') || '{}'),
        car: JSON.parse(localStorage.getItem('selectedCar') || '{}'),
        addons: cart,
        basePrice: basePriceFromCar,
        pricedAddonsTotal: parseFloat(document.getElementById('grand-total')?.textContent?.replace(/[^0-9.]/g, '') || 0) - basePriceFromCar,
        displayedTotal: document.getElementById('grand-total')?.textContent || '0.00 USD',
        note: "Some protections have price to be confirmed at pickup",
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('bookingSummary', JSON.stringify(finalData));
      window.location.href = 'payment.html'; // ← your next page
    });
  }
});





// // Payment Page Logic
// document.addEventListener('DOMContentLoaded', () => {
//   console.log("Payment page loaded. Checking localStorage...");

//   // Debug: show what's actually stored
//   console.log("lastCarRentalSearch:", localStorage.getItem('lastCarRentalSearch'));
//   console.log("selectedCar:", localStorage.getItem('selectedCar'));
//   console.log("addonCart:", localStorage.getItem('addonCart'));

//   // ─── Helpers ───────────────────────────────────────────────
//   const formatPrice = (num) => (typeof num === 'number' && !isNaN(num)) ? num.toFixed(2) : '—';

//   const daysBetween = (startStr, endStr) => {
//     if (!startStr || !endStr) return 7;
//     try {
//       const start = new Date(startStr);
//       const end = new Date(endStr);
//       if (isNaN(start) || isNaN(end)) return 7;
//       const diff = end - start;
//       return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
//     } catch (e) {
//       console.warn("Date parsing failed:", e);
//       return 7;
//     }
//   };

//   // ─── Load & Display Data ───────────────────────────────────
//   const displayBookingSummary = () => {
//     let search = {};
//     let car = {};
//     let addons = [];

//     try {
//       search = JSON.parse(localStorage.getItem('lastCarRentalSearch') || '{}');
//       car = JSON.parse(localStorage.getItem('selectedCar') || '{}');
//       addons = JSON.parse(localStorage.getItem('addonCart') || '[]');
//     } catch (err) {
//       console.error("Failed to parse localStorage data:", err);
//     }

//     if (search) {
//       document.getElementById('pickup-location-text').textContent =
//         search.pickupLocation || '—';

//       document.getElementById('pickup-time-text').textContent =
//         search.pickupDateTime
//           ? new Date(search.pickupDateTime).toLocaleString()
//           : '—';

//       document.getElementById('dropoff-time-text').textContent =
//         search.dropoffDateTime
//           ? new Date(search.dropoffDateTime).toLocaleString()
//           : '—';

//       // document.getElementById('driver-age-text').textContent =
//       //   search.driverAge || '—';
//     }


//     // 2. Your Car section
//     const carSection = document.getElementById('your-car-section');
//     if (carSection) {
//       if (car.name || car.id) {
//         carSection.innerHTML = `
//           <img src="${car.imageUrl || 'img/tesla.jpg'}" alt="${car.name || 'Vehicle'}">
//           <h2>Your Car</h2>
//           <hr>
//           <strong>${car.name || 'Selected Vehicle'} ${car.category ? `(${car.category})` : ''}</strong>
//           <p>${car.description || car.category || 'Similar vehicle'}</p>
//         `;
//       } else {
//         carSection.innerHTML = '<p><strong>No car selected.</strong> Please go back and choose a vehicle.</p>';
//       }
//     }

//     // 3. Price Details
//     const days = daysBetween(search.pickupDateTime, search.dropoffDateTime);

//     let basePrice = 0;
//     if (car.pricePerWeek && Number(car.pricePerWeek) > 0) {
//       const daily = Number(car.pricePerWeek) / 7;
//       basePrice = daily * days;
//     }

//     let pricedAddonsTotal = 0;
//     const addonsListEl = document.getElementById('addons-list');
//     if (addonsListEl) {
//       addonsListEl.innerHTML = '';

//       if (addons.length === 0) {
//         addonsListEl.innerHTML = '<div class="dtl"><span>No extras selected</span><strong>—</strong></div>';
//       }

//       addons.forEach(item => {
//         const isKnown = Number(item.price) > 0;
//         const itemPrice = isKnown
//           ? (item.type === 'day' ? Number(item.price) * days : Number(item.price))
//           : 0;

//         if (isKnown) pricedAddonsTotal += itemPrice;

//         const row = document.createElement('div');
//         row.className = 'dtl';
//         row.innerHTML = `
//           <span>${item.name || 'Unnamed Add-on'} ${item.type === 'day' ? `× ${days} days` : '(per rental)'}</span>
//           <strong>${isKnown ? formatPrice(itemPrice) + ' USD' : '—'}</strong>
//         `;
//         addonsListEl.appendChild(row);
//       });
//     }

//     // Base price row
//     const baseRow = document.getElementById('base-price-row');
//     if (baseRow) {
//       baseRow.innerHTML = basePrice > 0
//         ? `<span>Base Rental (${days} days)</span><strong>${formatPrice(basePrice)} USD</strong>`
//         : `<span>Base Rental Price</span><strong>To be confirmed</strong>`;
//     }

//     // Grand total
//     const grandTotalEl = document.getElementById('grand-total');
//     if (grandTotalEl) {
//       const total = basePrice + pricedAddonsTotal;
//       grandTotalEl.textContent = formatPrice(total) + ' USD';
//     }
//   };

//   // ─── Pay Now Handler ───────────────────────────────────────
//   const handlePayment = async () => {
//     const payBtn = document.getElementById('pay-now-btn');
//     if (!payBtn) return;

//     payBtn.disabled = true;
//     payBtn.textContent = 'Processing...';

//     // Get data from localStorage
//     let searchData = {};
//     let carData = {};
//     let addonsData = [];

//     try {
//       searchData = JSON.parse(localStorage.getItem('lastCarRentalSearch') || '{}');
//       carData = JSON.parse(localStorage.getItem('selectedCar') || '{}');
//       addonsData = JSON.parse(localStorage.getItem('addonCart') || '[]');
//     } catch (err) {
//       console.error("Failed to parse localStorage:", err);
//     }

//     // Collect form data + flatten required backend fields
//     const formData = {
//       firstName: document.querySelector('input[placeholder="First Name"]')?.value.trim() || '',
//       lastName: document.querySelector('input[placeholder="Last Name"]')?.value.trim() || '',
//       email: document.querySelector('input[placeholder="Email"]')?.value.trim() || '',
//       phone: document.querySelector('input[placeholder="Phone Number"]')?.value.trim() || '',
//       drivingLicense: document.querySelector('input[placeholder="Driving License"]')?.value.trim() || '',

//       cardHolder: document.querySelector('input[placeholder="Full Name on card"]')?.value.trim() || '',
//       cardNumber: document.querySelector('input[placeholder="XXXX XXXX XXXX XXXX"]')?.value.trim() || '',


//       expiryMonth: (() => {

//         const monthSelect = document.querySelector('#expiryMonth') ||
//           document.querySelector('select[name="expiryMonth"]') ||
//           document.querySelector('.month select'); // fallback

//         const val = monthSelect?.value?.trim();
//         return val && !isNaN(val) ? Number(val) : null;
//       })(),

//       expiryYear: (() => {
//         const yearSelect = document.getElementById('expiryYear'); // ← use the id!

//         const val = yearSelect?.value?.trim();
//         return val && !isNaN(val) ? Number(val) : null;
//       })(),

//       cvv: document.querySelector('input[placeholder="CVV"]')?.value.trim() || '',

//       // ─── FLATTENED FIELDS REQUIRED BY BACKEND ─────────────────────
//       pickupLocation: searchData.pickupLocation || '',
//       dropoffLocation: searchData.dropoffLocation || '',
//       pickupDateTime: searchData.pickupDateTime || '',
//       dropoffDateTime: searchData.dropoffDateTime || '',
//       sameLocation: searchData.sameDropoff === true,

//       carCategoryCode: carData.id || carData.categoryCode || carData.category || '',
//       carName: carData.name || '',
//       carDisplayCategory: carData.category || '',
//       pricePerWeek: Number(carData.pricePerWeek) || 0,
//       currency: carData.currency || 'USD',
//       seats: Number(carData.seats) || null,
//       doors: Number(carData.doors) || null,
//       transmission: carData.transmission || null,
//       fuelType: carData.fuel || carData.features?.find(f => f.type === 'fuel')?.value || null,
//       carImageUrl: carData.imageUrl || '',


//       // Keep full booking object (backend will ignore it, but useful for logging)
//       booking: {
//         search: searchData,
//         car: carData,
//         addons: addonsData
//       },

//       timestamp: new Date().toISOString()
//     };

//     // Simple client-side validation
//     if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
//       alert('Please fill in required personal details (name, email, phone).');
//       payBtn.disabled = false;
//       payBtn.textContent = 'Pay Now';
//       return;
//     }

//     if (!formData.carCategoryCode || !formData.carName) {
//       alert('Car information is missing. Please go back and select a vehicle again.');
//       payBtn.disabled = false;
//       payBtn.textContent = 'Pay Now';
//       return;
//     }

//     console.log("Sending to backend:", formData);

//     try {
//       const response = await fetch('/api/CarRentalEnquiries', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       console.log("Server response status:", response.status);
//       console.log("Server response:", response);

//       if (!response.ok) {
//         const errorBody = await response.json().catch(() => ({}));
//         console.error("Error details from server:", errorBody);
//         throw new Error(`Server error: ${response.status} - ${errorBody.title || 'Validation failed'}`);
//       }

//       const result = await response.json();
//       alert('Booking successful! Reference: ' + (result.id || result.bookingId || '—'));

//       // Optional: cleanup
//       localStorage.removeItem('addonCart');
//       localStorage.removeItem('selectedCar');

//       window.location.href = 'index.html';

//     } catch (err) {
//       console.error("Payment/Booking error:", err);
//       alert('Error: ' + err.message);
//       payBtn.disabled = false;
//       payBtn.textContent = 'Pay Now';
//     }
//   };

//   // ─── Run ──────────────────────────────────────────────────
//   displayBookingSummary();




//   const form = document.getElementById('payment-form');

// form.addEventListener('submit', (e) => {
//   e.preventDefault();

//   if (!form.checkValidity()) {
//     console.log('Invalid fields:');
//     [...form.elements].forEach(el => {
//       if (!el.checkValidity()) {
//         console.warn(el.id || el.name, el.validationMessage);
//       }
//     });

//     form.reportValidity();
//     return;
//   }

//   handlePayment();
// });






// });










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
      document.getElementById('pickup-location-text').textContent =
        search.pickupLocation || '—';

      document.getElementById('pickup-time-text').textContent =
        search.pickupDateTime
          ? new Date(search.pickupDateTime).toLocaleString()
          : '—';

      document.getElementById('dropoff-time-text').textContent =
        search.dropoffDateTime
          ? new Date(search.dropoffDateTime).toLocaleString()
          : '—';

      // document.getElementById('driver-age-text').textContent =
      //   search.driverAge || '—';
    }


    // 2. Your Car section
    const carSection = document.getElementById('your-car-section');
    if (carSection) {
      if (car.name || car.id) {
        carSection.innerHTML = `
          <img src="${car.imageUrl || 'img/tesla.jpg'}" alt="${car.name || 'Vehicle'}">
          <h2>Your Car</h2>
          <hr>
          <strong>${car.name || 'Selected Vehicle'} ${car.category ? `(${car.category})` : ''}</strong>
          <p>${car.description || car.category || 'Similar vehicle'}</p>
        `;
      } else {
        carSection.innerHTML = '<p><strong>No car selected.</strong> Please go back and choose a vehicle.</p>';
      }
    }

    // 3. Price Details
    const days = daysBetween(search.pickupDateTime, search.dropoffDateTime);

    let basePrice = 0;
    if (car.pricePerWeek && Number(car.pricePerWeek) > 0) {
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
        ? `<span>Base Rental (${days} days)</span><strong>${formatPrice(basePrice)} USD</strong>`
        : `<span>Base Rental Price</span><strong>To be confirmed</strong>`;
    }

    // Grand total
    const grandTotalEl = document.getElementById('grand-total');
    if (grandTotalEl) {
      const total = basePrice + pricedAddonsTotal;
      grandTotalEl.textContent = formatPrice(total) + ' USD';
    }
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

    // Collect form data using IDs
    const formData = {
      firstName: document.getElementById('firstName')?.value.trim() || '',
      lastName: document.getElementById('lastName')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      countryCode: document.getElementById('countryCode')?.value.trim() || '',  // Added country code
      phone: document.getElementById('phone')?.value.trim() || '',
      drivingLicense: document.getElementById('drivingLicense')?.value.trim() || '',
      driverAge: parseInt(document.getElementById('driverAge')?.value, 10) || null,  // Added driver age

      cardHolder: document.getElementById('cardHolder')?.value.trim() || '',
      cardNumber: document.getElementById('cardNumber')?.value.trim().replace(/\s/g, '') || '',  // Clean spaces

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
      seats: Number(carData.seats) || null,
      doors: Number(carData.doors) || null,
      transmission: carData.transmission || null,
      fuelType: carData.fuel || carData.features?.find(f => f.type === 'fuel')?.value || null,
      carImageUrl: carData.imageUrl || '',

      // Keep full booking object (backend will ignore it, but useful for logging)
      booking: {
        search: searchData,
        car: carData,
        addons: addonsData
      },

      timestamp: new Date().toISOString()
    };

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

      console.log("Server response status:", response.status);
      console.log("Server response:", response);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error("Error details from server:", errorBody);
        throw new Error(`Server error: ${response.status} - ${errorBody.title || 'Validation failed'}`);
      }

      const result = await response.json();
      alert('Booking successful! Reference: ' + (result.id || result.bookingId || '—'));

      // Optional: cleanup
      localStorage.removeItem('addonCart');
      localStorage.removeItem('selectedCar');

      window.location.href = 'index.html';

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